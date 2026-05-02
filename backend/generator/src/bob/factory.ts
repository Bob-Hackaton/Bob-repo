import { IBobClient, MockBobClient, RealBobClient } from './client.js';

export function createBobClient(): IBobClient {
  const apiKey = process.env.BOB_API_KEY;
  const enabled = process.env.BOB_ENABLED;

  if (enabled === 'false') {
    return new MockBobClient();
  }

  if (apiKey) {
    return new RealBobClient();
  }

  return new MockBobClient();
}
