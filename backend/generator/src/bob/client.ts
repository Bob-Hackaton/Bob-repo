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
  private projectId: string;
  private region: string;
  private modelId: string;

  constructor() {
    // Use globalThis to access process in Node.js environment
    const env = (globalThis as any).process?.env || {};
    this.apiKey = env.BOB_API_KEY || env.IBM_CLOUD_API_KEY || '';
    this.projectId = env.WATSONX_PROJECT_ID || '8c4b5bb2-83e8-4a70-8659-27507e7e91fa';
    this.region = env.WATSONX_REGION || 'us-south';
    this.modelId = env.WATSONX_MODEL_ID || 'ibm/granite-13b-chat-v2';
    
    if (!this.apiKey) {
      throw new Error('IBM_CLOUD_API_KEY environment variable is required for RealBobClient');
    }
  }

  async generate(prompt: BobPrompt): Promise<BobResponse> {
    try {
      console.log('🤖 Calling IBM watsonx.ai for code generation...');
      
      // Use dynamic import for node-fetch in Node.js environment
      const fetchModule = await import('node-fetch');
      const fetchFn = fetchModule.default;
      
      // Step 1: Get IAM token
      const tokenResponse = await fetchFn('https://iam.cloud.ibm.com/identity/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${this.apiKey}`,
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to get IAM token: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json() as any;
      const accessToken = tokenData.access_token;

      // Step 2: Call watsonx.ai generation API
      const systemPrompt = `You are an expert TypeScript developer specializing in MCP (Model Context Protocol) servers. Generate a complete, production-ready MCP server based on the user's description. Include:
1. Complete TypeScript code with proper types
2. All necessary dependencies
3. Environment variables needed
4. Security best practices
5. Error handling

Return ONLY valid JSON in this exact format:
{
  "name": "server-name",
  "description": "brief description",
  "projectName": "project-name",
  "tools": [{"name": "tool_name", "description": "what it does", "inputSchema": {...}}],
  "dependencies": ["package1", "package2"],
  "environmentVariables": [{"name": "VAR_NAME", "description": "what it's for", "required": true}],
  "securityNotes": ["security consideration 1", "security consideration 2"],
  "code": "// Complete TypeScript server code here"
}`;

      const userPrompt = `${prompt.systemInstructions || ''}\n\nUser Request: ${prompt.description}`;

      const watsonxUrl = `https://${this.region}.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29`;
      
      const response = await fetchFn(watsonxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model_id: this.modelId,
          input: `${systemPrompt}\n\n${userPrompt}`,
          parameters: {
            max_new_tokens: 4000,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 50,
          },
          project_id: this.projectId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ watsonx.ai API error:', errorText);
        throw new Error(`watsonx.ai API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as any;
      console.log('✅ watsonx.ai response received');
      
      // Extract generated text
      const generatedText = data.results?.[0]?.generated_text || '';
      
      // Try to parse JSON from the response
      let parsedData: any;
      try {
        // Find JSON in the response (it might be wrapped in markdown code blocks)
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse watsonx.ai response as JSON, using fallback');
        // Fallback: create a basic structure
        parsedData = {
          name: 'ai-generated-server',
          description: prompt.description,
          projectName: 'mcp-server',
          tools: [],
          dependencies: ['@modelcontextprotocol/sdk'],
          environmentVariables: [],
          securityNotes: ['Review generated code before deployment'],
        };
      }
      
      // Transform to our BobResponse format
      return {
        serverMetadata: {
          name: parsedData.name || 'generated-server',
          description: parsedData.description || prompt.description,
          suggestedProjectName: parsedData.projectName || 'mcp-server',
        },
        tools: parsedData.tools || [],
        environmentVariables: parsedData.environmentVariables || [],
        dependencies: parsedData.dependencies || ['@modelcontextprotocol/sdk'],
        securityNotes: parsedData.securityNotes || [],
      };
    } catch (error) {
      console.error('❌ watsonx.ai generation failed:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to generate with watsonx.ai: ${error.message}`
          : 'Failed to generate with watsonx.ai: unknown error'
      );
    }
  }
}

// Made with Bob
