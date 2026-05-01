/**
 * Types tests - Validate type contracts
 */
import { describe, it, expect, type } from 'vitest';
import type {
  GenerateMcpServerInput,
  GenerateMcpServerOutput,
  ToolDefinition,
  McpServerSchema,
  TemplateContext,
} from './types.js';

describe('GenerateMcpServerInput', () => {
  it('should accept valid input with description only', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    expect(input.description).toBe('Tool that looks up customer records by email');
  });

  it('should accept input with full context', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that searches Gmail',
      context: {
        env: { GMAIL_API_KEY: 'test' },
        authHints: ['oauth2', 'api-key'],
        complianceProfile: 'gdpr',
        preferredLanguage: 'typescript',
        deploymentTarget: 'ibm-code-engine',
      },
    };
    expect(input.context?.complianceProfile).toBe('gdpr');
    expect(input.context?.preferredLanguage).toBe('typescript');
  });
});

describe('GenerateMcpServerOutput', () => {
  it('should have required metadata fields', () => {
    const output: GenerateMcpServerOutput = {
      files: [],
      schema: {},
      metadata: {
        estimatedComplexity: 'low',
        suggestedDeps: [],
        toolName: 'test-tool',
        projectName: 'test-project',
        envVars: [],
        riskTags: [],
        generationMode: 'template',
        warnings: [],
      },
    };
    expect(['low', 'medium', 'high']).toContain(output.metadata.estimatedComplexity);
    expect(['template', 'bob', 'fallback']).toContain(output.metadata.generationMode);
  });
});

describe('ToolDefinition', () => {
  it('should have required fields', () => {
    const tool: ToolDefinition = {
      name: 'customer_lookup',
      description: 'Look up customer by email',
      inputSchema: { type: 'object', properties: { email: { type: 'string' } } },
    };
    expect(tool.name).toBeDefined();
    expect(typeof tool.inputSchema).toBe('object');
  });
});

describe('McpServerSchema', () => {
  it('should contain tools array', () => {
    const schema: McpServerSchema = {
      name: 'customer-server',
      description: 'Server for customer lookup',
      tools: [],
    };
    expect(Array.isArray(schema.tools)).toBe(true);
  });
});

describe('TemplateContext', () => {
  it('should allow optional complianceProfile', () => {
    const ctx: TemplateContext = {
      toolName: 'test',
      projectName: 'test-project',
      description: 'Test tool',
      complexity: 'medium',
      envVars: ['API_KEY'],
    };
    expect(ctx.complianceProfile).toBeUndefined();
  });
});