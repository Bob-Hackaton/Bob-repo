/**
 * Generate MCP Server tests - Validate generation output
 */
import { describe, it, expect } from 'vitest';
import { generateMcpServer } from './generateMcpServer.js';
import type { GenerateMcpServerInput } from './types.js';

describe('generateMcpServer', () => {
  it('generates files for customer lookup demo', async () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = await generateMcpServer(input);
    
    expect(output.files.length).toBe(7);
    // Tool name is snake_case from description (max 40 chars)
    expect(output.metadata.toolName).toContain('tool_that_looks_up_customer_records');
    // Project name is kebab-case from description (max 50 chars)
    expect(output.metadata.projectName).toContain('tool-that-looks-up-customer-records');
    expect(output.metadata.generationMode).toBe('template');
  });

  it('includes all required files', async () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = await generateMcpServer(input);
    const paths = output.files.map(f => f.path);
    
    expect(paths).toContain('package.json');
    expect(paths).toContain('tsconfig.json');
    expect(paths).toContain('src/server.ts');
    expect(paths).toContain('.env.example');
    expect(paths).toContain('README.md');
    expect(paths).toContain('Dockerfile');
    expect(paths).toContain('manifest.json');
  });

  it('generates valid package.json', async () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = await generateMcpServer(input);
    const pkg = JSON.parse(output.files.find(f => f.path === 'package.json')!.content);
    
    expect(pkg.name).toBe('tool-that-looks-up-customer-records-by-email');
    expect(pkg.dependencies['@modelcontextprotocol/sdk']).toBeDefined();
    expect(pkg.dependencies.zod).toBeDefined();
  });

  it('generates MCP schema with tool definition', async () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = await generateMcpServer(input);
    
    expect(output.schema).toHaveProperty('name');
    expect(output.schema).toHaveProperty('tools');
    expect(Array.isArray((output.schema as any).tools)).toBe(true);
  });

  it('includes env vars in output', async () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = await generateMcpServer(input);
    
    // Medium complexity includes NODE_ENV and API_TIMEOUT_MS
    expect(output.metadata.envVars).toContain('NODE_ENV');
    expect(output.metadata.envVars).toContain('API_TIMEOUT_MS');
  });

  it('estimates complexity correctly', async () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
    };
    
    const output = await generateMcpServer(input);
    
    // Simple lookup should be low or medium
    expect(['low', 'medium']).toContain(output.metadata.estimatedComplexity);
  });

  it('throws on invalid input', async () => {
    await expect(() => generateMcpServer({} as any)).rejects.toThrow('description is required');
    await expect(() => generateMcpServer(null as any)).rejects.toThrow('Invalid input');
  });

  it('includes warnings for high complexity', async () => {
    const input: GenerateMcpServerInput = {
      description: 'OAuth2 database authentication tool',
    };
    
    const output = await generateMcpServer(input);
    
    expect(output.metadata.warnings.length).toBeGreaterThan(0);
  });

  it('respects compliance profile in context', async () => {
    const input: GenerateMcpServerInput = {
      description: 'Tool that looks up customer records by email',
      context: {
        complianceProfile: 'gdpr',
      },
    };
    
    const output = await generateMcpServer(input);
    
    expect(output.metadata.riskTags).toContain('compliance-gdpr');
    expect(output.metadata.warnings).toContain('GDPR compliance required - implement data retention policies');
  });

  describe('Dynamic Bob Integration', () => {
    it('uses injected IBobClient and returns async generated output', async () => {
      const input = { description: 'test dynamic bob integration' };
      const client = {
        generate: async () => ({
          serverMetadata: { name: 'mock', description: '', suggestedProjectName: 'mock-proj' },
          tools: [{ name: 'mock', description: '', inputSchema: {}, implementationSnippet: 'code' }]
        })
      };
      
      const output = await generateMcpServer(input, client as any);
      
      expect(output.metadata.generationMode).toBe('bob');
      expect(output.metadata.toolName).toBe('mock');
      expect(output.metadata.projectName).toBe('mock-proj');
    });

    it('falls back to template generation when validator rejects', async () => {
      const input = { description: 'test fallback' };
      const client = {
        generate: async () => ({
          serverMetadata: { name: 'invalid', description: '', suggestedProjectName: '' },
          tools: [{ name: 'test', description: '', inputSchema: {}, implementationSnippet: 'eval("evil")' }]
        })
      };

      const output = await generateMcpServer(input, client as any);
      
      expect(output.metadata.generationMode).toBe('template');
      expect(output.metadata.toolName).toContain('test_fallback');
    });

    it('falls back to template generation when client throws', async () => {
      const input = { description: 'test throw' };
      const client = {
        generate: async () => { throw new Error('Network error'); }
      };

      const output = await generateMcpServer(input, client as any);
      
      expect(output.metadata.generationMode).toBe('template');
      expect(output.metadata.toolName).toContain('test_throw');
    });
  });
});