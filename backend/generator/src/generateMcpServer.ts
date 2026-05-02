/**
 * Generate MCP Server - Main function
 * Hardcoded demo: "Tool that looks up customer records by email"
 */
import type { GenerateMcpServerInput, GenerateMcpServerOutput, TemplateContext } from './types.js';
import { toProjectName, toToolName, toServerName } from './naming.js';
import { estimateComplexity, getRiskTags, getSuggestedDeps, getRequiredEnvVars } from './complexity.js';
import { generatePackageJson } from './templates/packageJson.js';
import { generateTsconfigJson } from './templates/tsconfigJson.js';
import { generateServerTs } from './templates/serverTs.js';
import { generateEnvExample } from './templates/envExample.js';
import { generateReadme } from './templates/readme.js';
import { generateDockerfile } from './templates/dockerfile.js';
import { generateManifestJson } from './templates/manifestJson.js';
import type { IBobClient } from './bob/client.js';
import { createBobClient } from './bob/factory.js';
import { BobValidator } from './bob/validator.js';
import { BobAdapter } from './bob/adapter.js';

/**
 * Generate MCP server project files from input description.
 * Uses dynamic Bob integration with fallback to template.
 */
export async function generateMcpServer(
  input: GenerateMcpServerInput,
  client: IBobClient = createBobClient()
): Promise<GenerateMcpServerOutput> {
  try {
    // Validate input
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected GenerateMcpServerInput');
    }
    if (!input.description || typeof input.description !== 'string') {
      throw new Error('Invalid input: description is required');
    }

    const description = input.description;

    try {
      if (client.constructor.name !== 'MockBobClient') {
        const response = await client.generate({
          description,
          systemInstructions: 'Generate a secure and robust MCP server that implements the following tool description. Follow the schema strictly.'
        });
        const validationResult = BobValidator.validate(response);
        if (validationResult.valid) {
          const output = BobAdapter.toGeneratorOutput(response, 'bob');
          output.metadata.warnings = [
            ...output.metadata.warnings,
            ...validationResult.errors.map(e => e.message)
          ];
          return output;
        }
        console.warn('Bob validation failed, falling back to template:', validationResult.errors);
      }
    } catch (error) {
      console.warn('Bob generation failed, falling back to template:', error instanceof Error ? error.message : String(error));
    }

    // Derive names from description
    const toolName = toToolName(description);
    const projectName = toProjectName(description);
    const serverName = toServerName(description);

    // Estimate complexity
    const complexity = estimateComplexity(description, input.context);

    // Get risk tags
    const riskTags = getRiskTags(description, input.context);

    // Get suggested dependencies
    const suggestedDeps = getSuggestedDeps(complexity);

    // Get required environment variables
    const envVars = getRequiredEnvVars(complexity, input.context);

    // Create template context
    const ctx: TemplateContext = {
      toolName,
      projectName,
      serverName,
      description,
      complexity,
      envVars,
      complianceProfile: input.context?.complianceProfile,
    };

    // Generate all files
    const files = [
      { path: 'package.json', content: generatePackageJson(ctx) },
      { path: 'tsconfig.json', content: generateTsconfigJson(ctx) },
      { path: 'src/server.ts', content: generateServerTs(ctx) },
      { path: '.env.example', content: generateEnvExample(ctx) },
      { path: 'README.md', content: generateReadme(ctx) },
      { path: 'Dockerfile', content: generateDockerfile(ctx) },
      { path: 'manifest.json', content: generateManifestJson(ctx) },
    ];

    // Generate MCP schema
    const schema = {
      name: projectName,
      description,
      tools: [
        {
          name: toolName,
          description,
          inputSchema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                description: 'Customer email address',
                format: 'email',
              },
            },
            required: ['email'],
          },
        },
      ],
    };

    // Collect warnings for safe defaults
    const warnings: string[] = [];
    if (complexity === 'high') {
      warnings.push('High complexity tool - ensure proper authentication and rate limiting');
    }
    if (riskTags.includes('pii-access')) {
      warnings.push('PII access detected - ensure GDPR compliance');
    }
    if (riskTags.includes('compliance-gdpr')) {
      warnings.push('GDPR compliance required - implement data retention policies');
    }

    return {
      files,
      schema,
      metadata: {
        estimatedComplexity: complexity,
        suggestedDeps,
        toolName,
        projectName,
        envVars,
        riskTags,
        generationMode: 'template',
        warnings,
      },
    };
  } catch (error) {
    // Safe error handling - never expose internal details
    throw new Error(
      error instanceof Error 
        ? `Failed to generate MCP server: ${error.message}`
        : 'Failed to generate MCP server: unknown error'
    );
  }
}