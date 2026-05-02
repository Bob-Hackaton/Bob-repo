# Sovereign Compliance Agent (MCP Server)

Owner: **Anthony**.

This is our differentiator. Built **as an MCP server** so it can be reused by any Bob user, not just our generator.

## What it does

Audits code (specifically MCP server code, but extensible) against:
- Security rules (secrets, banned libs, auth)
- GDPR (consent, residency, erasure)
- SOC2 (access controls, monitoring)
- HIPAA (PHI handling, encryption, audit logs)

## Setup

```bash
cd backend/policy-engine
npm install
```

Run the MCP server:

```bash
npm start
```

The server uses **stdio transport** and will listen for MCP JSON-RPC messages on stdin/stdout. Connect it to any MCP-compatible client (e.g., Claude Desktop, Cursor, VS Code with MCP extension).

## Testing

Run tests from the `backend/policy-engine` directory:

```bash
npm test
```

## The `audit` tool

The MCP server exposes a single tool: `audit`.

### Request format

```typescript
{
  code?: string;           // Plain-text source code to audit
  files?: {                // Alternative: file payloads
    path: string;          // Original file path
    content: string;       // Source code content
  }[];
  rules?: string[];        // Optional: specific rule IDs to run (default: all enabled)
}
```

The `code` and `files` fields are both optional. When both are omitted, the audit returns zero findings. Providing either triggers rule evaluation against the supplied content. The `rules` filter is optional; when omitted, all enabled starter rules are run.

### Response format

```typescript
{
  findings: {
    id: string;            // Rule ID that triggered
    category: "security" | "gdpr" | "soc2" | "hipaa" | "performance" | "best-practice";
    severity: "low" | "medium" | "high" | "critical";
    description: string;   // Human-readable finding description
    line?: number;         // 1-based line number where issue was detected
    remediation?: string;  // Suggested fix (only present when the rule defines auto_fix metadata)
    suggestion?: {         // Auto-fix metadata (metadata only — never mutates code)
      type: "env_var";
      suggestedReplacement: string;  // e.g., "process.env.API_KEY"
    };
    frameworks: string[]; // Compliance frameworks (e.g., ["SOC2", "HIPAA"])
  }[];
  summary: {
    total: number;
    security: number;
    compliance: number;
  };
}
```

If no rules match, `findings` is an empty array and `summary` reports zero counts.

### Example MCP tool call

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "audit",
    "arguments": {
      "code": "const api_key = 'sk-abc123xyz'; app.get('/admin', (req, res) => res.json({ secret: api_key }));",
      "rules": ["no-hardcoded-secrets", "missing-auth"]
    }
  }
}
```

## Starter rules

The server ships with five enabled rules:

| Rule ID | Category | Severity | Frameworks | What it detects |
|---------|----------|----------|------------|-----------------|
| `no-hardcoded-secrets` | security | high | SOC2, HIPAA | Hardcoded API keys, passwords, tokens ≥ 8 chars |
| `banned-libs` | security | high | SOC2 | Imports of `node-serialize`, `vm2`, `serialize-javascript` |
| `missing-auth` | best-practice | medium | SOC2, HIPAA | Sensitive routes (admin, user, patient, payment) without auth middleware |
| `pii-in-logs` | gdpr | high | GDPR, HIPAA, SOC2 | Logging of email, SSN, phone, patient, dob |
| `plaintext-storage` | security | high | SOC2, HIPAA, GDPR | localStorage/sessionStorage of passwords, tokens, SSN, email |

## Adding new compliance rules

Add a new rule to `src/starterRules.ts` following this structure:

```typescript
{
  id: "your-rule-id",           // Unique kebab-case identifier
  category: "security",         // security | gdpr | soc2 | hipaa | performance | best-practice
  severity: "high",             // low | medium | high | critical
  frameworks: ["SOC2"],        // Array of frameworks that this rule maps to
  description: "Human-readable description of what the rule detects",
  pattern: {
    type: "regex",
    expression: String.raw`your_regex_here`,  // Use String.raw to avoid escape issues
  },
  auto_fix: {                  // Optional: auto-fix metadata
    type: "env_var",
    template: "process.env.YOUR_SECRET",
  },
}
```

### Rule schema requirements

- `id`: non-empty string (whitespace-only is rejected by schema validation)
- `category`: one of: `security`, `gdpr`, `soc2`, `hipaa`, `performance`, `best-practice`
- `severity`: one of: `low`, `medium`, `high`, `critical`
- `frameworks`: non-empty array of non-empty strings
- `description`: non-empty string
- `pattern.type`: must be `"regex"`
- `pattern.expression`: must be a valid RegExp (invalid regex fails validation)
- `auto_fix.type`: if present, must be `"env_var"`

### Testing your rule

1. Add smoke tests in `src/rules.test.ts` for regex compilation.
2. Add behavior tests in `src/starterRules.test.ts` for finding detection.
3. Run `npm test` — all tests must pass before shipping.

## Framework mapping examples

### Security finding (SOC2 / HIPAA)

Triggered by: `no-hardcoded-secrets`, `banned-libs`, `plaintext-storage`

`no-hardcoded-secrets` emits a `remediation` field because it has `auto_fix` metadata:

```typescript
{
  id: "no-hardcoded-secrets",
  category: "security",
  severity: "high",
  description: "Detects hardcoded API keys, passwords, tokens, or secrets assigned inline.",
  line: 1,
  remediation: "Move the secret to an environment variable and read it from process.env.",
  frameworks: ["SOC2", "HIPAA"]
}
```

### GDPR finding (PII in logs)

Triggered by: `pii-in-logs`

This rule has no `auto_fix` metadata, so no `remediation` field is emitted:

```typescript
{
  id: "pii-in-logs",
  category: "gdpr",
  severity: "high",
  description: "Detects direct logging of common PII or PHI identifiers such as email, SSN, phone, or patient data.",
  line: 3,
  frameworks: ["GDPR", "HIPAA", "SOC2"]
}
```

**Why it matters under GDPR**: Logging PII without explicit consent violates data minimization principles (Article 5(1)(c)). **HIPAA note**: Patient identifiers in logs are a PHI breach risk.

### SOC2 finding (missing auth)

Triggered by: `missing-auth`

This rule has no `auto_fix` metadata, so no `remediation` field is emitted:

```typescript
{
  id: "missing-auth",
  category: "best-practice",
  severity: "medium",
  description: "Detects sensitive route handlers that appear to be registered without auth middleware.",
  line: 12,
  frameworks: ["SOC2", "HIPAA"]
}
```

**SOC2 CC6 requirement**: Access to sensitive data must be authenticated and authorized. Unprotected routes fail CC6.3.

### HIPAA finding (plaintext storage)

Triggered by: `plaintext-storage`

This rule has no `auto_fix` metadata, so no `remediation` field is emitted:

```typescript
{
  id: "plaintext-storage",
  category: "security",
  severity: "high",
  description: "Detects sensitive values being written to browser storage where data is stored in plaintext.",
  line: 5,
  frameworks: ["SOC2", "HIPAA", "GDPR"]
}
```

**HIPAA requirement**: PHI must be encrypted at rest. Browser storage is plaintext — it fails encryption requirements.

## Architecture

```
src/
  audit.ts          # Pure audit executor (regex-based, no I/O)
  audit.test.ts     # Audit executor tests
  contracts.ts      # Zod schemas for AuditRequest / AuditResponse
  rules.ts          # RuleSchema, validateRule, loadRules, createFindingFromRule
  rules.test.ts     # Rule validation tests
  server.ts         # MCP server with audit tool registration
  server.test.ts    # Handler integration tests
  starterRules.ts   # The 5 enabled compliance rules
  starterRules.test.ts  # Per-rule behavior tests
  index.ts          # Package entrypoint
```

The audit executor (`audit.ts`) is a **pure function** — it takes code and rules and returns findings. The MCP handler in `server.ts` wires the stdio transport to call this executor. This separation allows the core logic to be tested without MCP protocol overhead.

## Rule schema

```json
{
  "id": "no-hardcoded-secrets",
  "category": "security",
  "severity": "high",
  "frameworks": ["SOC2", "HIPAA"],
  "description": "Detects hardcoded API keys, passwords, tokens",
  "pattern": {
    "type": "regex",
    "expression": "(api[_-]?key|password|token)\\s*=\\s*['\"][^'\"]+['\"]"
  },
  "auto_fix": {
    "type": "env_var",
    "template": "process.env.{NAME}"
  }
}
```

## Day 1 goal
- MCP server skeleton with `audit` tool
- 5 starter rules: hardcoded-secrets, banned-libs, missing-auth, pii-in-logs, plaintext-storage