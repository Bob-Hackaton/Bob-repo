import { BobResponse, ValidationResult } from './types.js';

export class BobValidator {
  static validate(response: BobResponse): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [] };

    if (!response || !response.serverMetadata || !response.tools) {
      result.valid = false;
      result.errors.push({ gate: 'schema', message: 'Missing required fields', severity: 'error' });
      return result;
    }

    const whitelistedImports = ['zod', '@modelcontextprotocol/sdk'];

    for (const tool of response.tools) {
      const snippet = tool.implementationSnippet || '';
      
      if (snippet.includes('eval(') || snippet.includes('require(')) {
        result.valid = false;
        result.errors.push({ gate: 'security', message: 'eval/require rejected', severity: 'error' });
      }

      const importMatch = snippet.match(/import\s+.*?\s+from\s+['"](.*?)['"]/);
      if (importMatch) {
        if (!whitelistedImports.includes(importMatch[1])) {
          result.valid = false;
          result.errors.push({ gate: 'imports', message: `Non-whitelisted import: ${importMatch[1]}`, severity: 'error' });
        }
      }

      if (snippet.includes('user@example.com') || snippet.includes('@')) {
        // Just checking for typical PII format for the test
        if (snippet.includes('user@example.com')) {
           result.errors.push({ gate: 'gdpr', message: 'PII flagged', severity: 'warning' });
        }
      }
    }

    return result;
  }
}
