# MCP Server Generator — Day 1 Tasks
## Ownership
**Owner:** Alejandro
**Module:** backend/generator
**Purpose:** Convert a plain-English tool description into a complete MCP server project.

## 1. Core Contract
Input
```typescript
type GenerateMcpServerInput = {
  description: string; // Example: "Tool that searches Gmail"
  context?: {
    env?: Record<string, string>;
    authHints?: string[];
    complianceProfile?: "general" | "gdpr" | "soc2" | "hipaa";
    preferredLanguage?: "typescript";
    deploymentTarget?: "ibm-code-engine";
  };
};
```

Output
```typescript
type GenerateMcpServerOutput = {
  files: {
    path: string;
    content: string;
  }[];

  schema: object;

  metadata: {
    estimatedComplexity: "low" | "medium" | "high";
    suggestedDeps: string[];
    toolName: string;
    projectName: string;
    envVars: string[];
    riskTags: string[];
    generationMode: "template" | "bob" | "fallback";
    warnings: string[];
  };
};
```

## 1. Day 1 Goal — Hardcoded Template
Day 1 objective: Hardcoded template. No Bob yet. Just prove the I/O works.

### Day 1 Deliverable
Create a function: `generateMcpServer(input: GenerateMcpServerInput): GenerateMcpServerOutput`
For now, it can ignore most descriptions and always generate one stable demo server.
Use this demo description: "Tool that looks up customer records by email"

### Recommended Folder Structure
Create:
```
backend/generator/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── generateMcpServer.ts
│   ├── types.ts
│   ├── complexity.ts
│   ├── naming.ts
│   ├── demo.ts
│   └── templates/
│       ├── packageJson.ts
│       ├── tsconfigJson.ts
│       ├── serverTs.ts
│       ├── envExample.ts
│       ├── readme.ts
│       ├── dockerfile.ts
│       └── manifestJson.ts
└── README.md
```

## 4. Day 1 Tasks
- [x] **Task 1 — Define TypeScript contracts**
  - Create: `backend/generator/src/types.ts`
  - Acceptance: Types compile, Backend can import, Output contract matches.
- [x] **Task 2 — Implement naming helpers**
  - Create: `backend/generator/src/naming.ts`
  - Acceptance: No spaces in projectName, toolName uses snake_case, projectName uses kebab-case.
- [x] **Task 3 — Implement complexity estimator**
  - Create: `backend/generator/src/complexity.ts`
  - Acceptance: Simple tools return low, API/search return medium, OAuth/DB return high.
- [x] **Task 4 — Build hardcoded MCP schema**
  - Acceptance: Schema exists in output, has name/desc/inputSchema.
- [x] **Task 5 — Generate project files**
  - Files: package.json, tsconfig.json, src/server.ts, .env.example, README.md, Dockerfile, manifest.json.
  - Acceptance: Output includes all required files with content.
- [x] **Task 6 — Add safe template defaults**
  - Rules: No hardcoded secrets, use env vars, validate input, try/catch, timeouts, no raw PII.
- [x] **Task 7 — Add demo command**
  - Create: `backend/generator/src/demo.ts`
  - Acceptance: `npm run generate:demo` creates `generated/customer-lookup-mcp/` structure.

## GitHub Issues (Day 1)
- **Issue 1 — Define MCP generator contract**
- **Issue 2 — Create backend/generator module**
- **Issue 3 — Build hardcoded Day 1 MCP template**
- **Issue 4 — Generate customer lookup MCP demo server**
- **Issue 5 — Add safe defaults to generated server**
- **Issue 6 — Add demo generation command**

## Priority Order (Day 1)
1. `types.ts`
2. `generateMcpServer.ts`
3. `templates/`
4. `demo.ts`
5. `generate:demo` script
