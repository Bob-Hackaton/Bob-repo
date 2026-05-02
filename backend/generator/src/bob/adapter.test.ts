import { describe, it, expect } from 'vitest';
import { BobAdapter } from './adapter.js';
import { BobResponse } from './types.js';

describe('BobAdapter', () => {
  it('maps complete BobResponse to GenerateMcpServerOutput', () => {
    const response: BobResponse = {
      serverMetadata: { name: 'test', description: 'test', suggestedProjectName: 'test-proj' },
      tools: [{ name: 'tool', description: 'tool', inputSchema: {}, implementationSnippet: 'code' }],
      environmentVariables: ['ENV_VAR'],
      dependencies: ['dep1'],
      securityNotes: ['safe'],
    };

    const output = BobAdapter.toGeneratorOutput(response, 'bob');
    expect(output.metadata.generationMode).toBe('bob');
    expect(output.metadata.toolName).toBe('test');
    expect(output.metadata.projectName).toBe('test-proj');
    expect(output.metadata.envVars).toContain('ENV_VAR');
    expect(output.schema).toBeDefined();
    expect(output.files.length).toBeGreaterThan(0);
  });

  it('provides safe defaults for partial response', () => {
    const partialResponse = {
      serverMetadata: { name: 'test', description: 'test', suggestedProjectName: 'test-proj' },
      tools: [],
    } as unknown as BobResponse;

    const output = BobAdapter.toGeneratorOutput(partialResponse, 'fallback');
    expect(output.metadata.generationMode).toBe('fallback');
    expect(output.metadata.envVars).toEqual([]);
    expect(output.metadata.warnings.length).toBeGreaterThanOrEqual(0);
  });
});
