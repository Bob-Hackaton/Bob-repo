import { describe, it, expect } from 'vitest';
import { BobValidator } from './validator.js';
import { BobResponse } from './types.js';

describe('BobValidator', () => {
  const getValidResponse = (): BobResponse => ({
    serverMetadata: { name: 'test', description: 'test', suggestedProjectName: 'test-proj' },
    tools: [{ name: 'tool', description: 'tool', inputSchema: {}, implementationSnippet: 'const x = 1;' }],
    environmentVariables: [],
    dependencies: [],
    securityNotes: [],
  });

  it('passes a valid response', () => {
    const result = BobValidator.validate(getValidResponse());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects eval() in implementation snippet', () => {
    const response = getValidResponse();
    response.tools[0].implementationSnippet = 'eval("evil")';
    const result = BobValidator.validate(response);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: any) => e.gate === 'security')).toBe(true);
  });

  it('rejects non-whitelisted imports', () => {
    const response = getValidResponse();
    response.tools[0].implementationSnippet = 'import fs from "fs"';
    const result = BobValidator.validate(response);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: any) => e.gate === 'imports')).toBe(true);
  });

  it('flags PII as a warning but remains valid', () => {
    const response = getValidResponse();
    response.tools[0].implementationSnippet = 'const email = "user@example.com"';
    const result = BobValidator.validate(response);
    expect(result.valid).toBe(true);
    expect(result.errors.some((e: any) => e.severity === 'warning')).toBe(true);
  });
});
