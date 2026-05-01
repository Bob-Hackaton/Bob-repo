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

/**
 * Generate MCP server project files from input description.
 * For Day 1, uses hardcoded template for "customer lookup" demo.
 */
export function generateMcpServer(input: GenerateMcpServerInput): GenerateMcpServerOutput {
  try {
    // Validate input
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected GenerateMcpServerInput');
    }
    if (!input.description || typeof input.description !== 'string') {
      throw new Error('Invalid input: description is required');
    }

    // For Day 1: hardcoded demo description
    const description = input.description;

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