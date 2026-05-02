# Bob AI Integration: Request/Response Structure

To ensure a quick integration once we have the IBM Bob API keys, we will implement a clean interface following the **Adapter Pattern**. This separates the external API details from our core generator logic.

## 1. Data Contracts (`src/bob/types.ts`)

```typescript
import { GenerateMcpServerInput } from '../types';

/**
 * The structured request we send to IBM Bob.
 * It combines the user intent with system-level instructions.
 */
export interface BobRequest {
  prompt: string;
  context: GenerateMcpServerInput['context'];
  options?: {
    modelId?: string; // e.g., 'ibm/granite-20b-code-instruct'
    temperature?: number;
    maxTokens?: number;
  };
}

/**
 * What we EXPECT Bob to return. 
 * We will instruct Bob to return this JSON structure via System Prompt.
 */
export interface BobResponse {
  serverMetadata: {
    name: string;
    description: string;
    suggestedProjectName: string;
  };
  tools: Array<{
    name: string;
    description: string;
    inputSchema: object;
    implementationSnippet: string; // The specific logic for this tool
  }>;
  environmentVariables: string[];
  dependencies: string[];
  securityNotes: string[];
}
```

## 2. The Integration Boundary (`src/bob/client.ts`)

We will use an abstract client to allow for easy mocking during development.

```typescript
export interface IBobClient {
  generateMcpStructure(request: BobRequest): Promise<BobResponse>;
}

export class BobHttpClient implements IBobClient {
  constructor(private apiKey: string, private endpoint: string) {}

  async generateMcpStructure(request: BobRequest): Promise<BobResponse> {
    // TODO: Implement actual axios/fetch call to IBM Bob / watsonx.ai
    // For now, this is where the integration will live.
    throw new Error('Not implemented: Waiting for API Key');
  }
}
```

## 3. The Adapter (`src/bob/adapter.ts`)

The adapter transforms the AI-generated content into our standard `GenerateMcpServerOutput`.

```typescript
import { BobResponse } from './types';
import { GenerateMcpServerOutput } from '../types';

export class BobAdapter {
  static toGeneratorOutput(bob: BobResponse): GenerateMcpServerOutput {
    return {
      files: this.generateFiles(bob),
      schema: {
        name: bob.serverMetadata.name,
        description: bob.serverMetadata.description,
        tools: bob.tools.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema
        }))
      },
      metadata: {
        estimatedComplexity: this.calculateComplexity(bob),
        suggestedDeps: bob.dependencies,
        toolName: bob.serverMetadata.name,
        projectName: bob.serverMetadata.suggestedProjectName,
        envVars: bob.environmentVariables,
        riskTags: bob.securityNotes,
        generationMode: 'bob',
        warnings: []
      }
    };
  }

  private static generateFiles(bob: BobResponse) {
    // Uses Bob's code snippets to populate the server templates
    // or maps them to specific file paths.
    return []; 
  }

  private static calculateComplexity(bob: BobResponse): 'low' | 'medium' | 'high' {
    if (bob.tools.length > 5) return 'high';
    if (bob.tools.length > 2) return 'medium';
    return 'low';
  }
}
```

## 4. Deterministic Fallback Mechanism

As per PRD requirements, the system must maintain a **deterministic template fallback**. This ensures that if the agentic generation (Bob) fails, the user still receives a functional (albeit less customized) MCP server.

### Fallback Logic Flow

```typescript
async function orchestratedGenerate(input: GenerateMcpServerInput): Promise<GenerateMcpServerOutput> {
  // 1. Attempt Bob Generation (Agentic)
  if (isBobEnabled()) {
    try {
      const bobResponse = await bobClient.generateMcpStructure(toBobRequest(input));
      return BobAdapter.toGeneratorOutput(bobResponse);
    } catch (error) {
      console.error('[Bob] Generation failed, falling back to templates:', error);
      // Proceed to fallback
    }
  }

  // 2. Deterministic Template Fallback
  // This uses the established src/templates logic to ensure a working server is always delivered.
  const fallbackOutput = generateMcpServer(input); 
  
  return {
    ...fallbackOutput,
    metadata: {
      ...fallbackOutput.metadata,
      generationMode: 'fallback',
      warnings: [...fallbackOutput.metadata.warnings, 'Agentic generation failed; used deterministic fallback.']
    }
  };
}
```

### Why Determinism Matters
If Bob fails, the fallback must not introduce random variables. By using the existing `generateMcpServer.ts` logic, we guarantee:
- Valid TypeScript structure.
- Correct MCP SDK usage.
- Consistent file paths.
- Predictable security defaults based on the complexity analyzer.

### Generation Modes (`generationMode`)

| Mode | Trigger | Output Characteristics |
| :--- | :--- | :--- |
| `bob` | Successful Bob agentic run | Highly customized, dynamic tool logic, agent-optimized. |
| `template` | Bob disabled / explicit request | Standardized patterns, predictable logic, reliable structure. |
| `fallback` | Bob failure / timeout | Deterministic template output + warning metadata. |

## Next Steps

1. **Mock Implementation**: Create `MockBobClient` that returns hardcoded `BobResponse` for testing.
2. **Prompts**: Define the `SystemPrompt` that forces Bob to output exactly the `BobResponse` JSON schema.
3. **Integration**: Update `generateMcpServer.ts` to use `BobAdapter` and implement the `orchestratedGenerate` flow.
