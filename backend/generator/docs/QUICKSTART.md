# Day 1 Quickstart — MCP Server Generator

Operator guide for running, testing, and inspecting the Day 1 MCP server generator.

---

## Install

```bash
cd backend/generator
npm install
```

> **Windows:** If peer dependency errors occur with `@modelcontextprotocol/sdk`, use:
> ```bash
> npm install --legacy-peer-deps
> ```

---

## Run Tests

```bash
npm test
```

Expected output:
```
PASS (50) FAIL (0)
```

Run in watch mode during development:
```bash
npm run test:watch
```

---

## Run Demo — Generate MCP Server

```bash
npm run generate:demo
```

**Output location:** `generated/customer-lookup-mcp/`

**Expected file tree (7 files):**
```
generated/customer-lookup-mcp/
├── package.json
├── tsconfig.json
├── src/
│   └── server.ts
├── .env.example
├── README.md
├── Dockerfile
└── manifest.json
```

> **Safety:** Demo aborts if output dir exists (prevents data loss). To regenerate, delete first:
> ```bash
> rm -rf generated/customer-lookup-mcp
> npm run generate:demo
> ```

---

## Inspect Generated Project

```bash
cd generated/customer-lookup-mcp
cat README.md
```

Key generated files:

| File | Purpose |
|------|---------|
| `src/server.ts` | MCP server with `McpServer` + `StdioServerTransport` |
| `.env.example` | Env vars: `NODE_ENV`, `PORT`, `TIMEOUT_MS`, `LOG_LEVEL` |
| `package.json` | Scripts: `dev`, `build`, `start` |

### Run the generated server locally

```bash
cd generated/customer-lookup-mcp
npm install
npm run dev
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

---

## Expected Output — Demo Generation

```
🔧 Generating MCP server demo...
   Description: Tool that looks up customer records by email
   Output: generated/customer-lookup-mcp
   ✓ Created: package.json
   ✓ Created: tsconfig.json
   ✓ Created: src/server.ts
   ✓ Created: .env.example
   ✓ Created: README.md
   ✓ Created: Dockerfile
   ✓ Created: manifest.json

✅ Demo generated successfully!
   Location: generated/customer-lookup-mcp
   Files: 7
   Complexity: medium
   Tool: tool_that_looks_up_customer_records_by_e
   Project: tool-that-looks-up-customer-records-by-email
```

---

## Security Notes

All generated servers follow safe defaults:

| Rule | How |
|------|-----|
| **No hardcoded secrets** | All config via env vars |
| **No raw PII logging** | Logs `emailLength`, not email; uses masked IDs |
| **Input validation** | Zod schema + email regex in `server.ts` |
| **Timeouts** | `TIMEOUT_MS` env var, abort timer in lookup |
| **Safe errors** | Error wrapper hides internal details |

---

## Troubleshooting

### `npm install` fails on Windows

```bash
npm install --legacy-peer-deps
```

### Tests fail with "cannot find module"

Run `npm install` in `backend/generator` first.

### Peer dependency warnings with `@modelcontextprotocol/sdk`

These are non-fatal on Windows. Use `--legacy-peer-deps` if they cause failures.

### Generated tool name is truncated

Tool names are truncated to 40 chars (deterministic). This is by design — MCP tool names have a max length.

### Output directory already exists error

Delete `generated/customer-lookup-mcp` before re-running demo:
```bash
rm -rf generated/customer-lookup-mcp
npm run generate:demo
```

---

## Day 2 Handoff

Day 2 will replace the hardcoded template with real Bob API calls. Key modification points:

- `src/generateMcpServer.ts` — wire up `input.description` to Bob
- `src/templates/serverTs.ts` — keep safe defaults, update if needed
- Add tests for new Bob-driven paths

---

## Reference

- **Context7:** `/modelcontextprotocol/typescript-sdk`
- **SDK:** `@modelcontextprotocol/sdk` — `McpServer` + `StdioServerTransport`
- **Tests:** vitest 2.0+, 50 tests, all passing
- **Demo:** generates 7 files to `generated/customer-lookup-mcp/`
