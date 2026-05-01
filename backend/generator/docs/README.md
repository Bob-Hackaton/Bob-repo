# MCP Server Generator

**Owner:** Alejandro  
**Module:** `backend/generator`  
**Status:** ✅ Day 1 complete — 50 tests passing, demo generates 7 files

Converts a plain-English tool description into a complete MCP server project using the `@modelcontextprotocol/sdk`.

## Purpose

This module takes a plain-English description of a tool (e.g., "Tool that looks up customer records by email") and outputs a complete, ready-to-run MCP server project with:

- TypeScript server implementation using `McpServer` class
- Zod input validation
- Environment variable configuration
- Timeout handling
- Safe logging (no raw PII)
- Docker + IBM Code Engine deployment support

**Day 1 mode:** Hardcoded template for "customer lookup" demo.  
**Day 2 mode:** Real Bob calls for arbitrary tool descriptions.

---

## Installation

```bash
cd backend/generator
npm install
```

> **Windows users:** If you encounter peer dependency errors with `@modelcontextprotocol/sdk`, run:
> ```bash
> npm install --legacy-peer-deps
> ```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests (vitest, headless) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | TypeScript type checking |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run generate:demo` | Generate demo MCP server to `generated/customer-lookup-mcp/` |

---

## Public API

### Core Function

```typescript
import { generateMcpServer } from './src/index.js';

const output = generateMcpServer({
  description: 'Tool that looks up customer records by email',
  context: {
    env: { NODE_ENV: 'production' },
    complianceProfile: 'gdpr',
    deploymentTarget: 'ibm-code-engine',
  },
});
```

### Input Contract

```typescript
type GenerateMcpServerInput = {
  description: string;                          // Plain-English tool description
  context?: {
    env?: Record<string, string>;               // Custom env vars
    authHints?: string[];                        // e.g., ['oauth2']
    complianceProfile?: 'general' | 'gdpr' | 'soc2' | 'hipaa';
    preferredLanguage?: 'typescript';
    deploymentTarget?: 'ibm-code-engine';
  };
};
```

### Output Contract

```typescript
type GenerateMcpServerOutput = {
  files: { path: string; content: string }[];    // Project files
  schema: object;                               // MCP tool schema
  metadata: {
    estimatedComplexity: 'low' | 'medium' | 'high';
    suggestedDeps: string[];
    toolName: string;                            // snake_case, max 40 chars
    projectName: string;                         // kebab-case, max 50 chars
    envVars: string[];
    riskTags: string[];
    generationMode: 'template' | 'bob' | 'fallback';
    warnings: string[];
  };
};
```

### Exports

| Export | Description |
|--------|-------------|
| `GenerateMcpServerInput` | Input type |
| `GenerateMcpServerOutput` | Output type |
| `ToolDefinition` | Tool schema type |
| `McpServerSchema` | Full MCP schema type |
| `TemplateContext` | Internal template context |
| `generateMcpServer` | Main generation function |
| `toProjectName()` | Convert description → kebab-case project name |
| `toToolName()` | Convert description → snake_case tool name |
| `toServerName()` | Convert description → PascalCase server name |
| `isValidProjectName()` | Validate project name (≤50 chars, kebab) |
| `isValidToolName()` | Validate tool name (≤40 chars, snake) |
| `estimateComplexity()` | Estimate `low`/`medium`/`high` |
| `getRiskTags()` | Get risk tags from description |
| `getSuggestedDeps()` | Get deps based on complexity |
| `getRequiredEnvVars()` | Get env vars for complexity level |
| `ComplexityLevel` | Type for complexity levels |
| `generatePackageJson()` | Template generator (package.json) |
| `generateTsconfigJson()` | Template generator (tsconfig.json) |
| `generateServerTs()` | Template generator (server.ts) |
| `generateEnvExample()` | Template generator (.env.example) |
| `generateReadme()` | Template generator (README.md) |
| `generateDockerfile()` | Template generator (Dockerfile) |
| `generateManifestJson()` | Template generator (manifest.json) |

---

## Generated Files

Running `npm run generate:demo` produces `generated/customer-lookup-mcp/` with 7 files:

```
generated/customer-lookup-mcp/
├── package.json       # Node.js project config, deps, scripts
├── tsconfig.json     # TypeScript config
├── src/
│   └── server.ts     # MCP server with McpServer + StdioServerTransport
├── .env.example     # Environment variables template
├── README.md         # Project documentation
├── Dockerfile        # Container image for IBM Code Engine
└── manifest.json     # MCP manifest
```

### Generated server.ts features

| Feature | Implementation |
|---------|----------------|
| **Server class** | `McpServer` from `@modelcontextprotocol/sdk` |
| **Transport** | `StdioServerTransport` (stdio-based MCP protocol) |
| **Validation** | `zod` for email input schema |
| **Timeouts** | Configurable via `TIMEOUT_MS` env var |
| **Logging** | `LOG_LEVEL` env var, no raw PII in logs |

### Environment variables (.env.example)

```
NODE_ENV=development
PORT=3000
TIMEOUT_MS=30000
LOG_LEVEL=info
```

---

## Safety Defaults

All generated servers follow secure-by-default rules:

| Rule | Implementation |
|------|----------------|
| **No hardcoded secrets** | All sensitive config via env vars |
| **Input validation** | Zod schema + manual email regex |
| **Try/catch** | Comprehensive error handling |
| **Timeouts** | Configurable `TIMEOUT_MS`, abort timer in `lookupCustomerByEmail` |
| **No raw PII logging** | Logger uses `emailLength` not email; uses masked IDs |
| **Safe error messages** | Error wrapper hides internal details |

---

## Testing

Tests use **vitest** (headless, no UI):

```bash
# Run all tests
npm test

# Watch mode during development
npm run test:watch

# TypeScript type checking only
npm run typecheck
```

**Test coverage (Day 1):** 50 tests passing

| Test file | What it tests |
|-----------|---------------|
| `types.test.ts` | Type contracts compile and match spec |
| `naming.test.ts` | Project name kebab-case, tool name snake_case |
| `complexity.test.ts` | Complexity estimation (`low`/`medium`/`high`) |
| `generateMcpServer.test.ts` | Full generation flow, output structure |

---

## Demo Generation

```bash
npm run generate:demo
```

**Output:** `generated/customer-lookup-mcp/` with 7 files

**Safety:** The demo script aborts if the output directory already exists (prevents accidental data loss).

To regenerate, delete the directory first:
```bash
rm -rf generated/customer-lookup-mcp
npm run generate:demo
```

---

## Limitations (Day 1)

- **Hardcoded template:** Only generates "customer lookup" MCP server regardless of input description
- **No Bob integration:** Real AI-powered generation comes in Day 2
- **TypeScript only:** Only `preferredLanguage: 'typescript'` is supported
- **Simulated lookup:** The `lookupCustomerByEmail` function returns mock data — replace with real DB/API call
- **Tool name truncation:** Names >40 chars are truncated (deterministic)

---

## Day 2 Handoff

For the next agent implementing Day 2:

1. **Replace hardcoded template** in `generateMcpServer.ts` with Bob API calls
2. **Wire up `input.description`** to Bob prompt instead of ignoring it
3. **Preserve safety defaults** — all Day 1 rules must remain in generated output
4. **Update `generationMode`** in metadata from `'template'` to `'bob'`
5. **Add tests** for new Bob-driven generation paths

Key files to modify:
- `src/generateMcpServer.ts` — main logic (currently ignores description)
- `src/types.ts` — if Bob returns different schema shape
- `src/templates/*.ts` — only if new file types are needed

---

## Reference

- **Context7 ID:** `/modelcontextprotocol/typescript-sdk`
- **SDK:** `@modelcontextprotocol/sdk` — `McpServer` class with `registerTool()` and `StdioServerTransport`
- **Validation:** `zod` v3.23.8+ for input schema generation
- **Tests:** vitest 2.0+ with TypeScript ESM
