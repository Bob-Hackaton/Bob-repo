/**
 * Naming helpers tests - Validate naming conventions
 */
import { describe, it, expect } from 'vitest';
import {
  toProjectName,
  toToolName,
  toServerName,
  isValidProjectName,
  isValidToolName,
} from './naming.js';

describe('toProjectName', () => {
  it('converts description to kebab-case', () => {
    expect(toProjectName('Customer Lookup Tool')).toBe('customer-lookup-tool');
  });

  it('removes special characters', () => {
    expect(toProjectName('Tool @#$% that works!')).toBe('tool-that-works');
  });

  it('handles multiple spaces', () => {
    expect(toProjectName('Tool   with    spaces')).toBe('tool-with-spaces');
  });

  it('trims leading/trailing hyphens', () => {
    expect(toProjectName('  Test Tool  ')).toBe('test-tool');
  });

  it('returns fallback for empty input', () => {
    expect(toProjectName('')).toBe('unnamed-project');
    expect(toProjectName(null as unknown as string)).toBe('unnamed-project');
  });

  it('limits length to 50 chars', () => {
    const long = 'a'.repeat(60);
    expect(toProjectName(long).length).toBe(50);
  });
});

describe('toToolName', () => {
  it('converts description to snake_case', () => {
    expect(toToolName('Customer Lookup')).toBe('customer_lookup');
  });

  it('removes special characters except underscores', () => {
    expect(toToolName('Tool @#$% works')).toBe('tool_works');
  });

  it('handles multiple underscores', () => {
    expect(toToolName('Tool   with    spaces')).toBe('tool_with_spaces');
  });

  it('returns fallback for empty input', () => {
    expect(toToolName('')).toBe('unnamed_tool');
    expect(toToolName(null as unknown as string)).toBe('unnamed_tool');
  });
});

describe('toServerName', () => {
  it('converts to PascalCase', () => {
    expect(toServerName('customer lookup')).toBe('CustomerLookup');
  });

  it('capitalizes first letter of each word', () => {
    expect(toServerName('my great tool')).toBe('MyGreatTool');
  });

  it('removes special characters', () => {
    expect(toServerName('Tool @#$% works!')).toBe('ToolWorks');
  });

  it('returns fallback for empty input', () => {
    expect(toServerName('')).toBe('UnnamedServer');
  });
});

describe('isValidProjectName', () => {
  it('validates kebab-case names', () => {
    expect(isValidProjectName('my-project')).toBe(true);
    expect(isValidProjectName('customer-lookup')).toBe(true);
  });

  it('rejects invalid names', () => {
    expect(isValidProjectName('MyProject')).toBe(false); // uppercase
    expect(isValidProjectName('my_project')).toBe(false); // snake_case not kebab
    expect(isValidProjectName('a')).toBe(false); // too short
    expect(isValidProjectName('a'.repeat(51))).toBe(false); // too long
  });
});

describe('isValidToolName', () => {
  it('validates snake_case names', () => {
    expect(isValidToolName('customer_lookup')).toBe(true);
    expect(isValidToolName('get_user_data')).toBe(true);
  });

  it('rejects invalid names', () => {
    expect(isValidToolName('customer-lookup')).toBe(false); // kebab not snake
    expect(isValidToolName('CustomerLookup')).toBe(false); // PascalCase
    expect(isValidToolName('a')).toBe(false); // too short
  });
});