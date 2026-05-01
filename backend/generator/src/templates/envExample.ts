/**
 * .env.example template for generated MCP server
 * No hardcoded secrets - all values from environment
 */
import type { TemplateContext } from '../types.js';

export function generateEnvExample(_ctx: TemplateContext): string {
  return `# MCP Server Configuration
# Copy to .env and fill in actual values

# Environment
NODE_ENV=development

# Server
PORT=3000

# Timeouts (milliseconds)
TIMEOUT_MS=30000

# Logging
LOG_LEVEL=info

# Customer Lookup API (optional)
# CUSTOMER_API_URL=https://api.example.com
# CUSTOMER_API_KEY=your_api_key_here

# Rate Limiting (high complexity only)
# RATE_LIMIT_MAX=100
# RATE_LIMIT_WINDOW_MS=60000

# OAuth2 (high complexity, if auth hints present)
# OAUTH_CLIENT_ID=your_client_id
# OAUTH_CLIENT_SECRET=your_client_secret
# OAUTH_REDIRECT_URI=http://localhost:3000/callback
`;
}