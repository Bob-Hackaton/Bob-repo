/**
 * Generate MCP Server tests - Validate generation output
 */
import { describe, it, expect } from 'vitest';
import { generateMcpServer } from './generateMcpServer.js';
import type { GenerateMcpServerInput } from './types.js';

describe('generateMcpServer', () => {
  it('generates files for customer lookup demo', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = generateMcpServer(input);
    
    expect(output.files.length).toBe(7);
    // Tool name is snake_case from description (max 40 chars)
    expect(output.metadata.toolName).toContain('tool_that_looks_up_customer_records');
    // Project name is kebab-case from description (max 50 chars)
    expect(output.metadata.projectName).toContain('tool-that-looks-up-customer-records');
    expect(output.metadata.generationMode).toBe('template');
  });

  it('includes all required files', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = generateMcpServer(input);
    const paths = output.files.map(f => f.path);
    
    expect(paths).toContain('package.json');
    expect(paths).toContain('tsconfig.json');
    expect(paths).toContain('src/server.ts');
    expect(paths).toContain('.env.example');
    expect(paths).toContain('README.md');
    expect(paths).toContain('Dockerfile');
    expect(paths).toContain('manifest.json');
  });

  it('generates valid package.json', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = generateMcpServer(input);
    const pkg = JSON.parse(output.files.find(f => f.path === 'package.json')!.content);
    
    expect(pkg.name).toBe('tool-that-looks-up-customer-records-by-email');
    expect(pkg.dependencies['@modelcontextprotocol/sdk']).toBeDefined();
    expect(pkg.dependencies.zod).toBeDefined();
  });

  it('generates MCP schema with tool definition', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = generateMcpServer(input);
    
    expect(output.schema).toHaveProperty('name');
    expect(output.schema).toHaveProperty('tools');
    expect(Array.isArray((output.schema as any).tools)).toBe(true);
  });

  it('includes env vars in output', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = generateMcpServer(input);
    
    // Medium complexity includes NODE_ENV and API_TIMEOUT_MS
    expect(output.metadata.envVars).toContain('NODE_ENV');
    expect(output.metadata.envVars).toContain('API_TIMEOUT_MS');
  });

  it('estimates complexity correctly', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = generateMcpServer(input);
    
    // Simple lookup should be low or medium
    expect(['low', 'medium']).toContain(output.metadata.estimatedComplexity);
  });

  it('throws on invalid input', () => {
    expect(() => generateMcpServer({} as any)).toThrow('description is required');
    expect(() => generateMcpServer(null as any)).toThrow('Invalid input');
  });

  it('includes warnings for high complexity', () => {
    const input: GenerateMcpServerInput = {
      description: 'OAuth2 database authentication tool',
    };
    
    const output = generateMcpServer(input);
    
    expect(output.metadata.warnings.length).toBeGreaterThan(0);
  });

  it('respects compliance profile in context', () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
      context: {
        complianceProfile: 'gdpr',
      },
    };
    
    const output = generateMcpServer(input);
    
    expect(output.metadata.riskTags).toContain('compliance-gdpr');
    expect(output.metadata.warnings).toContain('GDPR compliance required - implement data retention policies');
  });
});