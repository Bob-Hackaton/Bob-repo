import { GenerateMcpServerInput } from '../types.js';

export interface BobPrompt {
  description: string;
  context?: GenerateMcpServerInput['context'];
  systemInstructions: string;
}

export interface BobResponse {
  serverMetadata: { name: string; description: string; suggestedProjectName: string };
  tools: Array<{ name: string; description: string; inputSchema: object; implementationSnippet: string }>;
  environmentVariables: string[];
  dependencies: string[];
  securityNotes: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ gate: string; message: string; severity: 'error' | 'warning' }>;
}
