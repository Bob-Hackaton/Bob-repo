import { GenerateMcpServerOutput } from '../types.js';
import { BobResponse } from './types.js';

export class BobAdapter {
  static toGeneratorOutput(response: BobResponse, mode: 'bob' | 'fallback'): GenerateMcpServerOutput {
    return {
      files: response.tools && response.tools.length > 0 ? [{ path: 'src/index.ts', content: response.tools[0].implementationSnippet || '' }] : [],
      schema: response.tools && response.tools.length > 0 ? response.tools[0].inputSchema || {} : {},
      metadata: {
        estimatedComplexity: 'low',
        suggestedDeps: response.dependencies || [],
        toolName: response.serverMetadata?.name || 'unknown',
        projectName: response.serverMetadata?.suggestedProjectName || 'unknown',
        envVars: response.environmentVariables || [],
        riskTags: response.securityNotes || [],
        generationMode: mode,
        warnings: [],
      },
    };
  }
}
