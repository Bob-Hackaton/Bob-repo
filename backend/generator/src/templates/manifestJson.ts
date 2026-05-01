/**
 * manifest.json template for MCP server
 */
import type { TemplateContext } from '../types.js';

export function generateManifestJson(ctx: TemplateContext): string {
  return JSON.stringify({
    name: ctx.projectName,
    version: '1.0.0',
    description: ctx.description,
    server: {
      name: ctx.projectName,
      version: '1.0.0',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      }
    },
    tools: [
      {
        name: ctx.toolName,
        description: ctx.description,
        inputSchema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Customer email address',
              format: 'email'
            }
          },
          required: ['email']
        }
      }
    ],
    generatedBy: 'bob-mcp-forge',
    generatedAt: new Date().toISOString()
  }, null, 2);
}