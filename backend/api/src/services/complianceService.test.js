import { describe, it, expect } from 'vitest';
import { runComplianceAudit, __internals } from './complianceService.js';

const { isValidInput, MAX_FILES, MAX_FILE_SIZE, REPO_ROOT, COMPLIANCE_WRAPPER } = __internals;

describe('complianceService', () => {
  describe('isValidInput (validation helper)', () => {
    it('returns null for valid input with no files', () => {
      expect(isValidInput({ description: 'A tool' })).toBeNull();
    });

    it('returns null for valid input with files array', () => {
      expect(isValidInput({ description: 'Tool', files: [{ path: 'a.ts', content: 'x' }] })).toBeNull();
    });

    it('returns error for missing description', () => {
      expect(isValidInput({})).toBe('Description is required and must be a string');
    });

    it('returns error for non-string description', () => {
      expect(isValidInput({ description: 123 })).toBe('Description is required and must be a string');
    });

    it('returns error for empty description', () => {
      expect(isValidInput({ description: '' })).toBe('Description is required and must be a string');
    });

    it('returns error for non-array files', () => {
      expect(isValidInput({ description: 'Tool', files: 'not-array' })).toBe('files must be an array');
    });

    it('returns error for too many files', () => {
      const tooManyFiles = Array.from({ length: 15 }, (_, i) => ({ path: `f${i}.ts`, content: 'x' }));
      expect(isValidInput({ description: 'Tool', files: tooManyFiles })).toBe(`Too many files: maximum ${MAX_FILES} allowed`);
    });

    it('returns error for file missing path', () => {
      expect(isValidInput({ description: 'Tool', files: [{ content: 'x' }] })).toBe('Each file must have path and content');
    });

    it('returns error for file missing content', () => {
      expect(isValidInput({ description: 'Tool', files: [{ path: 'f.ts' }] })).toBe('Each file must have path and content');
    });

    it('returns error for file too large', () => {
      expect(isValidInput({ description: 'Tool', files: [{ path: 'f.ts', content: 'x'.repeat(512_001) }] }))
        .toBe(`File f.ts exceeds maximum size of ${MAX_FILE_SIZE} bytes`);
    });
  });

  describe('runComplianceAudit (validation integration)', () => {
    it('throws for missing description', async () => {
      await expect(runComplianceAudit({})).rejects.toThrow('Description is required and must be a string');
    });

    it('throws for non-string description', async () => {
      await expect(runComplianceAudit({ description: 123 })).rejects.toThrow('Description is required and must be a string');
    });

    it('throws for empty description', async () => {
      await expect(runComplianceAudit({ description: '' })).rejects.toThrow('Description is required and must be a string');
    });

    it('throws for non-array files', async () => {
      await expect(runComplianceAudit({ description: 'Tool', files: 'not-array' })).rejects.toThrow('files must be an array');
    });

    it('throws for too many files', async () => {
      const tooManyFiles = Array.from({ length: 15 }, (_, i) => ({ path: `f${i}.ts`, content: 'x' }));
      await expect(runComplianceAudit({ description: 'Tool', files: tooManyFiles })).rejects.toThrow(`Too many files: maximum ${MAX_FILES} allowed`);
    });

    it('throws for file missing path', async () => {
      await expect(runComplianceAudit({ description: 'Tool', files: [{ content: 'x' }] })).rejects.toThrow('Each file must have path and content');
    });

    it('throws for file missing content', async () => {
      await expect(runComplianceAudit({ description: 'Tool', files: [{ path: 'f.ts' }] })).rejects.toThrow('Each file must have path and content');
    });

    it('throws for file too large', async () => {
      await expect(runComplianceAudit({ description: 'Tool', files: [{ path: 'f.ts', content: 'x'.repeat(512_001) }] }))
        .rejects.toThrow(`File f.ts exceeds maximum size of ${MAX_FILE_SIZE} bytes`);
    });
  });

  describe('path constants', () => {
    it('REPO_ROOT ends with bob-mcp-forge', () => {
      expect(REPO_ROOT.endsWith('bob-mcp-forge')).toBe(true);
    });

    it('COMPLIANCE_WRAPPER includes complianceWrapper.ts', () => {
      expect(COMPLIANCE_WRAPPER.includes('complianceWrapper')).toBe(true);
    });

    it('COMPLIANCE_WRAPPER is inside REPO_ROOT', () => {
      expect(COMPLIANCE_WRAPPER.startsWith(REPO_ROOT)).toBe(true);
    });
  });

  describe('limits constants', () => {
    it('MAX_FILES is 10', () => {
      expect(MAX_FILES).toBe(10);
    });

    it('MAX_FILE_SIZE is 512000', () => {
      expect(MAX_FILE_SIZE).toBe(512_000);
    });
  });
});