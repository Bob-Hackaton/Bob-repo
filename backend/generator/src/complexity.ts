/**
 * Complexity estimator for MCP server generation
 * Analyzes tool descriptions to estimate implementation complexity.
 */

export type ComplexityLevel = 'low' | 'medium' | 'high';

/**
 * Complexity indicators by level
 */
interface ComplexityIndicators {
  keywords: string[];
  riskTags: string[];
}

/**
 * Keywords that indicate higher complexity
 */
const HIGH_COMPLEXITY_KEYWORDS = [
  'oauth', 'oauth2', 'authentication', 'database', 'sql', 'postgres', 'mysql',
  'mongodb', 'redis', 'elasticsearch', 'webhook', 'payment', 'stripe', 'billing',
  'admin', 'privileged', 'delete', 'remove', 'destroy', 'drop', 'user data',
  'pii', 'personal', 'health', 'medical', 'hipaa', 'financial', 'banking',
  'transfer', 'transaction', 'crypto', 'blockchain', 'api key', 'secret',
];

const MEDIUM_COMPLEXITY_KEYWORDS = [
  'search', 'query', 'filter', 'sort', 'pagination', 'batch', 'bulk',
  'email', 'mail', 'sms', 'notification', 'webhook', 'integration',
  'external', 'third-party', 'api', 'http', 'rest', 'graphql',
  'file', 'upload', 'download', 'document', 'pdf', 'csv',
  'transform', 'convert', 'process', 'analyze',
];

const HIGH_COMPLEXITY_RISK_TAGS = [
  'authentication',
  'data-deletion',
  'pii-access',
  'payment-processing',
  'admin-privileges',
  'data-export',
];

const MEDIUM_COMPLEXITY_RISK_TAGS = [
  'external-api',
  'file-access',
  'email-sending',
  'notification',
  'search-capability',
];

/**
 * Check if description indicates high complexity
 */
function isHighComplexity(description: string, context?: GenerateMcpServerInput['context']): boolean {
  const lowerDesc = description.toLowerCase();
  return HIGH_COMPLEXITY_KEYWORDS.some(keyword => lowerDesc.includes(keyword));
}

/**
 * Check if description indicates medium complexity
 */
function isMediumComplexity(description: string): boolean {
  const lowerDesc = description.toLowerCase();
  return MEDIUM_COMPLEXITY_KEYWORDS.some(keyword => lowerDesc.includes(keyword));
}

/**
 * Check compliance-related complexity
 */
function hasComplianceComplexity(context?: GenerateMcpServerInput['context']): boolean {
  if (!context?.complianceProfile) return false;
  return ['gdpr', 'soc2', 'hipaa'].includes(context.complianceProfile);
}

/**
 * Check deployment-related complexity
 */
function hasDeploymentComplexity(context?: GenerateMcpServerInput['context']): boolean {
  if (!context?.deploymentTarget) return false;
  return context.deploymentTarget === 'ibm-code-engine';
}

/**
 * Estimate complexity based on tool description and context.
 */
export function estimateComplexity(
  description: string,
  context?: GenerateMcpServerInput['context']
): ComplexityLevel {
  if (!description || typeof description !== 'string') {
    return 'low';
  }

  let complexity: ComplexityLevel = 'low';

  if (isHighComplexity(description, context)) {
    complexity = 'high';
  } else if (isMediumComplexity(description)) {
    complexity = 'medium';
  }

  if (complexity !== 'high' && hasComplianceComplexity(context)) {
    complexity = 'high';
  }

  if (complexity === 'low' && hasDeploymentComplexity(context)) {
    complexity = 'medium';
  }

  return complexity;
}

/**
 * Get risk tags based on description and context.
 */
export function getRiskTags(
  description: string,
  context?: GenerateMcpServerInput['context']
): string[] {
  const tags: string[] = [];
  const lowerDesc = description.toLowerCase();

  HIGH_COMPLEXITY_KEYWORDS.forEach(keyword => {
    if (lowerDesc.includes(keyword)) {
      const tag = keyword.toLowerCase().replace(/\s+/g, '-');
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
  });

  if (context?.complianceProfile) {
    tags.push(`compliance-${context.complianceProfile}`);
  }

  if (context?.authHints?.includes('oauth2')) {
    tags.push('oauth2-auth');
  }

  return tags;
}

/**
 * Get suggested dependencies based on complexity.
 */
export function getSuggestedDeps(complexity: ComplexityLevel): string[] {
  const deps = ['@modelcontextprotocol/sdk', 'zod'];

  switch (complexity) {
    case 'high':
      deps.push('express', 'helmet', 'cors', 'express-rate-limit');
      break;
    case 'medium':
      deps.push('axios');
      break;
    case 'low':
    default:
      break;
  }

  return deps;
}

/**
 * Get environment variables needed based on complexity.
 */
export function getRequiredEnvVars(
  complexity: ComplexityLevel,
  context?: GenerateMcpServerInput['context']
): string[] {
  const envVars = ['NODE_ENV'];

  switch (complexity) {
    case 'high':
      envVars.push('LOG_LEVEL', 'RATE_LIMIT_MAX', 'TIMEOUT_MS');
      if (context?.authHints?.includes('oauth2')) {
        envVars.push('OAUTH_CLIENT_ID', 'OAUTH_CLIENT_SECRET', 'OAUTH_REDIRECT_URI');
      }
      break;
    case 'medium':
      envVars.push('API_TIMEOUT_MS', 'LOG_LEVEL');
      break;
    case 'low':
    default:
      envVars.push('PORT');
      break;
  }

  if (context?.env) {
    Object.keys(context.env).forEach(key => {
      if (!envVars.includes(key)) {
        envVars.push(key);
      }
    });
  }

  return envVars;
}