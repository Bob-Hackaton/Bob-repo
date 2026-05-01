/**
 * Bob MCP Forge - Generator Module
 * Public API for MCP server generation
 */

// Types
export type {
  GenerateMcpServerInput,
  GenerateMcpServerOutput,
  ToolDefinition,
  McpServerSchema,
  TemplateContext,
} from './types.js';

// Core generation function
export { generateMcpServer } from './generateMcpServer.js';

// Naming helpers
export {
  toProjectName,
  toToolName,
  toServerName,
  isValidProjectName,
  isValidToolName,
} from './naming.js';

// Complexity estimation
export {
  estimateComplexity,
  getRiskTags,
  getSuggestedDeps,
  getRequiredEnvVars,
  type ComplexityLevel,
} from './complexity.js';

// Template generators (for advanced usage)
export { generatePackageJson } from './templates/packageJson.js';
export { generateTsconfigJson } from './templates/tsconfigJson.js';
export { generateServerTs } from './templates/serverTs.js';
export { generateEnvExample } from './templates/envExample.js';
export { generateReadme } from './templates/readme.js';
export { generateDockerfile } from './templates/dockerfile.js';
export { generateManifestJson } from './templates/manifestJson.js';