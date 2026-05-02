import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBobClient } from './factory.js';
import { MockBobClient, RealBobClient } from './client.js';

describe('createBobClient', () => {
  beforeEach(() => {
    vi.stubEnv('BOB_API_KEY', '');
    vi.stubEnv('BOB_ENABLED', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns RealBobClient when BOB_API_KEY is present and BOB_ENABLED is not false', () => {
    vi.stubEnv('BOB_API_KEY', 'secret');
    const client = createBobClient();
    expect(client.constructor.name).toBe('RealBobClient');
  });

  it('returns MockBobClient when BOB_API_KEY is absent', () => {
    const client = createBobClient();
    expect(client.constructor.name).toBe('MockBobClient');
  });

  it('returns MockBobClient when BOB_ENABLED is false, even with key', () => {
    vi.stubEnv('BOB_API_KEY', 'secret');
    vi.stubEnv('BOB_ENABLED', 'false');
    const client = createBobClient();
    expect(client.constructor.name).toBe('MockBobClient');
  });
});
