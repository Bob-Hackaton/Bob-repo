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
  async generate(_prompt: BobPrompt): Promise<BobResponse> {
    throw new Error('Not implemented');
  }
}
