/**
 * Compliance wrapper - executes generator + audit via tsx
 * Input: JSON via stdin, Output: JSON via stdout
 */
const { generateMcpServer } = await import('./index.ts');
const { pathToFileURL, fileURLToPath } = await import('url');
const { dirname, join } = await import('path');
const { readFileSync } = await import('fs');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// backend/generator/src -> backend/generator -> backend -> bob-mcp-forge
const backendRoot = join(__dirname, '../..');
const policyEngineRoot = join(backendRoot, 'policy-engine');
const auditUrl = pathToFileURL(join(policyEngineRoot, 'src/audit.ts')).href;
const { auditCode } = await import(auditUrl);

// Read input from stdin
const input = JSON.parse(readFileSync(0, 'utf-8'));
const { description, files, complianceProfile } = input;

if (files && files.length > 0) {
  // Audit pre-generated files
  const auditResult = auditCode({ files });
  console.log(JSON.stringify({ auditResult }));
} else {
  // Generate then audit
  const output = await generateMcpServer({ description, context: { complianceProfile } });
  const auditResult = auditCode({ files: output.files });
  console.log(JSON.stringify({ generatedFiles: output.files, auditResult }));
}
