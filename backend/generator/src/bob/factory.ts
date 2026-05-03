import { IBobClient, MockBobClient, RealBobClient } from './client.js';

export function createBobClient(): IBobClient {
  const apiKey = process.env.BOB_API_KEY || process.env.IBM_CLOUD_API_KEY;
  const enabled = process.env.BOB_ENABLED;

  console.log('🔧 Factory: BOB_ENABLED =', enabled);
  console.log('🔧 Factory: API Key present =', !!apiKey);

  if (enabled === 'false') {
    console.log('📋 Using MockBobClient (BOB_ENABLED=false)');
    return new MockBobClient();
  }

  if (apiKey) {
    console.log('🚀 Using RealBobClient (watsonx.ai)');
    return new RealBobClient();
  }

  console.log('📋 Using MockBobClient (no API key)');
  return new MockBobClient();
}
