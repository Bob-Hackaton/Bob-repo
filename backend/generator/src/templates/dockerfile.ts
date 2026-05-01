/**
 * Dockerfile template for generated MCP server
 */
import type { TemplateContext } from '../types.js';

export function generateDockerfile(ctx: TemplateContext): string {
  const nodeVersion = '20-alpine';
  
  return `# ${ctx.projectName} - MCP Server
# Multi-stage build for production

FROM node:${nodeVersion} AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build
RUN npm run build

# Production image
FROM node:${nodeVersion}

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S mcp-server -u 1001

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Set ownership
RUN chown -R mcp-server:nodejs /app

# Switch to non-root user
USER mcp-server

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD node -e "process.exit(0)"

# Run
CMD ["node", "dist/server.js"]
`;
}