import { describe, it, expect } from 'vitest';
import { MockBobClient } from './client.js';

describe('MockBobClient', () => {
  it('returns valid BobResponse shape without network resolution', async () => {
    const client = new MockBobClient();
    const response = await client.generate({
      description: 'test',
      systemInstructions: 'test',
    });
    
    expect(response).toBeDefined();
    expect(response.serverMetadata).toBeDefined();
    expect(response.tools).toBeInstanceOf(Array);
    expect(response.environmentVariables).toBeInstanceOf(Array);
    expect(response.dependencies).toBeInstanceOf(Array);
    expect(response.securityNotes).toBeInstanceOf(Array);
  });
});
