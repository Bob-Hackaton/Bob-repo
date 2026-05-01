/**
 * Server.ts template for generated MCP server
 * Uses @modelcontextprotocol/sdk with StdioServerTransport
 * Safe defaults: env vars, validation, try/catch, timeout, no hardcoded secrets
 */
import type { TemplateContext } from '../types.js';

export function generateServerTs(ctx: TemplateContext): string {
  return `/**
 * MCP Server - ${ctx.serverName || ctx.projectName}
 * Generated from: ${ctx.description}
 * Safe defaults: env vars, validation, try/catch, timeout
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod/v4';

const PORT = parseInt(process.env.PORT || '3000', 10);
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '30000', 10);
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Logger with safe output (no PII)
function log(level: string, message: string, meta?: object): void {
  if (LOG_LEVEL === 'debug' || level !== 'debug') {
    console.error(\`[\${level.toUpperCase()}] \${message}\`, meta ? JSON.stringify(meta) : '');
  }
}

// Initialize MCP Server
const server = new McpServer({
  name: '${ctx.projectName}',
  version: '1.0.0',
}, {
  capabilities: {
    logging: {}
  },
  instructions: 'Customer lookup tool. Always validate email format before searching.',
});

// Register customer lookup tool
server.registerTool(
  '${ctx.toolName}',
  {
    description: 'Look up customer records by email address. Validates email format.',
    inputSchema: z.object({
      email: z.string().email().describe('Customer email address'),
    }),
  },
  async ({ email }, { timeoutMs }) => {
    const actualTimeout = timeoutMs || TIMEOUT_MS;
    
    try {
      // Validate input
      if (!email || typeof email !== 'string') {
        throw new Error('Email is required');
      }
      
      // Basic email validation
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          content: [{ type: 'text', text: 'Invalid email format' }],
          isError: true,
        };
      }
      
      log('info', 'Looking up customer', { emailLength: email.length });
      
      // Simulate customer lookup with timeout
      const customer = await lookupCustomerByEmail(email, actualTimeout);
      
      return {
        content: [{ 
          type: 'text', 
          text: JSON.stringify(customer, null, 2) 
        }],
      };
    } catch (error) {
      log('error', 'Customer lookup failed', { error: error instanceof Error ? error.message : 'Unknown' });
      return {
        content: [{ type: 'text', text: error instanceof Error ? error.message : 'Unknown error' }],
        isError: true,
      };
    }
  }
);

// Safe customer lookup with timeout
async function lookupCustomerByEmail(email: string, timeoutMs: number): Promise<object> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Customer lookup timed out'));
    }, timeoutMs);
    
    // Simulated lookup - replace with actual database/API call
    // NEVER log email (PII) - only log length for debugging
    try {
      // Simulated customer data
      const customer = {
        email,
        id: 'cust_' + Buffer.from(email).toString('base64').slice(0, 12),
        found: true,
        message: 'Customer record retrieved successfully'
      };
      
      clearTimeout(timer);
      resolve(customer);
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

// Connect to stdio transport
async function main(): Promise<void> {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log('info', 'Server started on stdio');
  } catch (error) {
    log('error', 'Failed to start server', { error: error instanceof Error ? error.message : 'Unknown' });
    process.exit(1);
  }
}

main();
`;
}