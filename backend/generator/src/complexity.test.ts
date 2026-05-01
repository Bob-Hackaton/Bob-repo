/**
 * Complexity estimator tests - Validate complexity analysis
 */
import { describe, it, expect } from 'vitest';
import {
  estimateComplexity,
  getRiskTags,
  getSuggestedDeps,
  getRequiredEnvVars,
  type ComplexityLevel,
} from './complexity.js';
import type { GenerateMcpServerInput } from './types.js';

describe('estimateComplexity', () => {
  it('returns low for simple tools', () => {
    expect(estimateComplexity('Hello world tool')).toBe('low');
    expect(estimateComplexity('Simple greeting')).toBe('low');
  });

  it('returns medium for search/API tools', () => {
    expect(estimateComplexity('Search for customer records')).toBe('medium');
    expect(estimateComplexity('Query external service')).toBe('medium');
    expect(estimateComplexity('Send email notification')).toBe('medium');
  });

  it('returns high for database/auth tools', () => {
    expect(estimateComplexity('Database query tool')).toBe('high');
    expect(estimateComplexity('OAuth2 authentication handler')).toBe('high');
    expect(estimateComplexity('Payment processing tool')).toBe('high');
    expect(estimateComplexity('Delete user data')).toBe('high');
  });

  it('returns high for GDPR compliance', () => {
    const context: GenerateMcpServerInput['context'] = {
      complianceProfile: 'gdpr',
    };
    expect(estimateComplexity('Customer lookup', context)).toBe('high');
  });

  it('returns medium for IBM Code Engine deployment', () => {
    const context: GenerateMcpServerInput['context'] = {
      deploymentTarget: 'ibm-code-engine',
    };
    expect(estimateComplexity('Simple tool', context)).toBe('medium');
  });

  it('handles empty description', () => {
    expect(estimateComplexity('')).toBe('low');
    expect(estimateComplexity(null as unknown as string)).toBe('low');
  });
});

describe('getRiskTags', () => {
  it('returns empty array for low risk tools', () => {
    const tags = getRiskTags('Simple hello tool');
    expect(tags).toHaveLength(0);
  });

  it('identifies authentication risks', () => {
    const tags = getRiskTags('OAuth2 login tool');
    expect(tags).toContain('oauth2');
  });

  it('identifies compliance tags', () => {
    const context: GenerateMcpServerInput['context'] = {
      complianceProfile: 'gdpr',
    };
    const tags = getRiskTags('Customer lookup', context);
    expect(tags).toContain('compliance-gdpr');
  });

  it('identifies oauth2 auth hint', () => {
    const context: GenerateMcpServerInput['context'] = {
      authHints: ['oauth2'],
    };
    const tags = getRiskTags('API tool', context);
    expect(tags).toContain('oauth2-auth');
  });
});

describe('getSuggestedDeps', () => {
  it('returns base deps for low complexity', () => {
    const deps = getSuggestedDeps('low');
    expect(deps).toContain('@modelcontextprotocol/sdk');
    expect(deps).toContain('zod');
    expect(deps).not.toContain('express');
  });

  it('adds axios for medium complexity', () => {
    const deps = getSuggestedDeps('medium');
    expect(deps).toContain('axios');
  });

  it('adds security packages for high complexity', () => {
    const deps = getSuggestedDeps('high');
    expect(deps).toContain('express');
    expect(deps).toContain('helmet');
    expect(deps).toContain('cors');
    expect(deps).toContain('express-rate-limit');
  });
});

describe('getRequiredEnvVars', () => {
  it('returns basic env vars for low complexity', () => {
    const envVars = getRequiredEnvVars('low');
    expect(envVars).toContain('NODE_ENV');
    expect(envVars).toContain('PORT');
  });

  it('returns medium env vars for medium complexity', () => {
    const envVars = getRequiredEnvVars('medium');
    expect(envVars).toContain('API_TIMEOUT_MS');
    expect(envVars).toContain('LOG_LEVEL');
  });

  it('returns high env vars for high complexity', () => {
    const envVars = getRequiredEnvVars('high');
    expect(envVars).toContain('LOG_LEVEL');
    expect(envVars).toContain('RATE_LIMIT_MAX');
    expect(envVars).toContain('TIMEOUT_MS');
  });

  it('includes oauth env vars when auth hint present', () => {
    const context: GenerateMcpServerInput['context'] = {
      authHints: ['oauth2'],
    };
    const envVars = getRequiredEnvVars('high', context);
    expect(envVars).toContain('OAUTH_CLIENT_ID');
    expect(envVars).toContain('OAUTH_CLIENT_SECRET');
  });
});