import { BobPrompt, BobResponse } from './types.js';

export interface IBobClient {
  generate(prompt: BobPrompt): Promise<BobResponse>;
}

export class MockBobClient implements IBobClient {
  async generate(prompt: BobPrompt): Promise<BobResponse> {
    return {
      serverMetadata: { name: 'mock', description: prompt.description, suggestedProjectName: 'mock-proj' },
      tools: [],
      environmentVariables: [],
      dependencies: [],
      securityNotes: [],
    };
  }
}

export class RealBobClient implements IBobClient {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    // Use globalThis to access process in Node.js environment
    const env = (globalThis as any).process?.env || {};
    this.apiKey = env.BOB_API_KEY || '';
    this.apiUrl = env.BOB_API_URL || 'https://bob.ibm.com/api/v1';
    
    if (!this.apiKey) {
      throw new Error('BOB_API_KEY environment variable is required for RealBobClient');
    }
  }

  async generate(prompt: BobPrompt): Promise<BobResponse> {
    try {
      // Use dynamic import for node-fetch in Node.js environment
      const fetchModule = await import('node-fetch');
      const fetchFn = fetchModule.default;
      
      const response = await fetchFn(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt.description,
          systemInstructions: prompt.systemInstructions || 'Generate a secure MCP server implementation',
          format: 'mcp-server',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bob API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as any;
      
      // Transform Bob API response to our BobResponse format
      return {
        serverMetadata: {
          name: data.name || 'generated-server',
          description: data.description || prompt.description,
          suggestedProjectName: data.projectName || 'mcp-server',
        },
        tools: data.tools || [],
        environmentVariables: data.environmentVariables || [],
        dependencies: data.dependencies || [],
        securityNotes: data.securityNotes || [],
      };
    } catch (error) {
      // Use globalThis.console for logging
      if ((globalThis as any).console) {
        (globalThis as any).console.error('Bob API call failed:', error);
      }
      throw new Error(
        error instanceof Error
          ? `Failed to generate with Bob: ${error.message}`
          : 'Failed to generate with Bob: unknown error'
      );
    }
  }
}
