Use this as your final scoped task list for the MCP Server Generator.

MCP Server Generator — Alejandro Task Plan
Ownership

Owner: Alejandro
Module: backend/generator
Purpose: Convert a plain-English tool description into a complete MCP server project.

The project brief already assigns you the generator area: backend/generator/ # MCP server generator (Alejandro).

1. Core Contract

This contract should become your source of truth.

Input
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

Minimal example:

{
  "description": "Tool that searches Gmail"
}

Extended example:

{
  "description": "Tool that looks up customer records by email",
  "context": {
    "authHints": ["Use API token from environment variables"],
    "complianceProfile": "gdpr",
    "deploymentTarget": "ibm-code-engine"
  }
}
Output
type GenerateMcpServerOutput = {
  files: {
    path: string;
    content: string;
  }[];

  schema: object;

  metadata: {
    estimatedComplexity: "low" | "medium" | "high";
    suggestedDeps: string[];
  };
};

Recommended expanded version:

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

Why expand it? Because the compliance engine and deploy service will need more than just files, schema, and suggestedDeps.

Mental model: your generator should not only return the code. It should return the shipping label for that code: what it is, what dependencies it needs, what risks it carries, and how it was generated.

1. Day 1 Goal — Hardcoded Template

Day 1 objective:

Hardcoded template. No Bob yet. Just prove the I/O works.

This matches the original project plan: “Alejandro: scaffold MCP generator with hardcoded template (no Bob yet).”

Day 1 Deliverable

Create a function:

generateMcpServer(input: GenerateMcpServerInput): GenerateMcpServerOutput

For now, it can ignore most descriptions and always generate one stable demo server.

Use this demo description:

Tool that looks up customer records by email

The project brief also uses this as the demo example: “Tool that looks up customer records by email.”

1. Recommended Folder Structure

Create:

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
4. Day 1 Tasks
Task 1 — Define TypeScript contracts

Create:

backend/generator/src/types.ts

Add:

export type GenerateMcpServerInput = {
  description: string;
  context?: {
    env?: Record<string, string>;
    authHints?: string[];
    complianceProfile?: "general" | "gdpr" | "soc2" | "hipaa";
    preferredLanguage?: "typescript";
    deploymentTarget?: "ibm-code-engine";
  };
};

export type GeneratedFile = {
  path: string;
  content: string;
};

export type GenerateMcpServerOutput = {
  files: GeneratedFile[];
  schema: Record<string, unknown>;
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

Acceptance criteria:

Types compile.
Backend can import the input/output types.
Output contract matches the agreed shape.
Task 2 — Implement naming helpers

Create:

backend/generator/src/naming.ts

Purpose:

Convert natural language into safe project and tool names.

Example:

"Tool that looks up customer records by email"

Should become:

projectName: customer-lookup-mcp
toolName: customer_lookup_by_email

Acceptance criteria:

No spaces in projectName.
No unsafe characters in toolName.
Tool name uses snake_case.
Project name uses kebab-case.
Task 3 — Implement complexity estimator

Create:

backend/generator/src/complexity.ts

Simple Day 1 logic:

export function estimateComplexity(description: string): "low" | "medium" | "high" {
  const text = description.toLowerCase();

  if (
    text.includes("oauth") ||
    text.includes("hipaa") ||
    text.includes("patient") ||
    text.includes("multi-step") ||
    text.includes("database")
  ) {
    return "high";
  }

  if (
    text.includes("api") ||
    text.includes("customer") ||
    text.includes("email") ||
    text.includes("search")
  ) {
    return "medium";
  }

  return "low";
}

Acceptance criteria:

Simple tools return low.
API/search/customer tools return medium.
OAuth/HIPAA/database tools return high.
Task 4 — Build hardcoded MCP schema

Create a schema for the demo tool:

const schema = {
  name: "customer_lookup_by_email",
  description: "Look up a customer record by email from an internal API.",
  inputSchema: {
    type: "object",
    properties: {
      email: {
        type: "string",
        description: "Customer email address"
      }
    },
    required: ["email"]
  }
};

Acceptance criteria:

Schema exists in output.
Schema has name, description, inputSchema.
Input schema requires email.
Task 5 — Generate project files

Your files array should include at minimum:

package.json
tsconfig.json
src/server.ts
.env.example
README.md
Dockerfile
manifest.json

Example output shape:

{
  "files": [
    {
      "path": "package.json",
      "content": "..."
    },
    {
      "path": "src/server.ts",
      "content": "..."
    }
  ],
  "schema": {},
  "metadata": {}
}

Acceptance criteria:

Output includes all required files.
Each file has path and content.
No empty file contents.
Task 6 — Add safe template defaults

Your generated server should include these rules by default:

No hardcoded secrets.
Use environment variables.
Validate email input.
Use try/catch.
Use timeout for external API calls.
Do not log raw PII.
Return safe error messages.

This aligns with the project’s compliance examples: “No hardcoded secrets,” “PII handling needs encryption,” and “Insecure direct API call.”

Acceptance criteria:

.env.example includes required variables.
server.ts reads secrets from process.env.
server.ts validates email format.
server.ts does not contain fake API keys.
Task 7 — Add demo command

Create:

backend/generator/src/demo.ts

It should call:

generateMcpServer({
  description: "Tool that looks up customer records by email"
});

Then write the result to:

generated/customer-lookup-mcp/

Add script:

{
  "scripts": {
    "generate:demo": "tsx src/demo.ts"
  }
}

Acceptance criteria:

npm run generate:demo

Creates:

generated/customer-lookup-mcp/
├── package.json
├── tsconfig.json
├── src/server.ts
├── .env.example
├── README.md
├── Dockerfile
└── manifest.json
5. Day 2 Goal — Replace Template with Bob Calls

Day 2 objective:

Replace template with real Bob calls.

The project brief also says Day 2 should “Replace hardcoded generator output with real Bob calls.”

Important: do not let Bob generate the entire project freely.

Better architecture:

Bob generates the tool-specific logic.
Your templates control the project structure.

That means Bob can generate:

tool name
description
input schema
handler logic
env vars
risk tags
dependency suggestions

Your generator still owns:

package.json
Dockerfile
folder layout
README structure
MCP server wrapper
metadata format
fallback behavior
6. Day 2 Tasks
Task 8 — Create Bob adapter

Create:

backend/generator/src/bob/
├── BobClient.ts
├── buildBobPrompt.ts
├── parseBobResponse.ts
└── types.ts

Acceptance criteria:

BobClient is isolated from generator logic.
Generator can run without Bob in template mode.
Bob failures are caught.
Task 9 — Build constrained Bob prompt

Create:

backend/generator/src/bob/buildBobPrompt.ts

Prompt should demand JSON only:

You are generating the tool-specific parts of a TypeScript MCP server.

Return ONLY valid JSON.

Shape:
{
  "toolName": "snake_case_tool_name",
  "description": "short tool description",
  "inputSchema": {},
  "handlerCode": "TypeScript handler body only",
  "envVars": [],
  "suggestedDeps": [],
  "riskTags": [],
  "estimatedComplexity": "low | medium | high"
}

Rules:

- Do not include hardcoded secrets.
- Use environment variables for credentials.
- Validate all inputs.
- Do not log PII.
- Do not generate package.json.
- Do not generate Dockerfile.
- Do not invent real credentials.
- Keep the handler minimal.

Acceptance criteria:

Prompt requests structured JSON.
Prompt prevents project-wide uncontrolled generation.
Prompt requires env vars and dependencies.
Prompt includes safety constraints.
Task 10 — Parse Bob response

Create:

backend/generator/src/bob/parseBobResponse.ts

It should validate:

Valid JSON
toolName exists
inputSchema exists
handlerCode exists
suggestedDeps is array
estimatedComplexity is valid

If invalid, return fallback.

Acceptance criteria:

Invalid Bob output does not crash demo.
Missing fields are handled.
Unsafe tool names are sanitized.
Task 11 — Add generation modes

Update input context or function options:

type GenerationMode = "template" | "bob" | "auto";

Recommended behavior:

template = use hardcoded template only
bob = use Bob only
auto = try Bob, fallback to template

Acceptance criteria:

Template mode works offline.
Bob mode uses Bob.
Auto mode falls back safely.
Fallback reason appears in metadata.warnings.
Task 12 — Merge Bob output into templates

Pipeline:

description
→ Bob prompt
→ Bob JSON response
→ normalize
→ insert into MCP template
→ return GenerateMcpServerOutput

Acceptance criteria:

Bob controls only tool-specific parts.
Generated output still matches contract.
Compliance can scan generated files.
Frontend can display generated files.
7. Final GitHub Issue List
Issue 1 — Define MCP generator contract

Owner: Alejandro
Goal: Define input/output types for the generator.

Acceptance criteria:

GenerateMcpServerInput exists.
GenerateMcpServerOutput exists.
GeneratedFile exists.
Metadata includes complexity and suggested dependencies.
Issue 2 — Create backend/generator module

Owner: Alejandro
Goal: Create the generator package and folder structure.

Acceptance criteria:

backend/generator exists.
npm install works.
npm run build works.
src/index.ts exports generateMcpServer.
Issue 3 — Build hardcoded Day 1 MCP template

Owner: Alejandro
Goal: Generate one deterministic MCP server without Bob.

Acceptance criteria:

Input description produces files array.
Output includes schema.
Output includes metadata.
No Bob dependency.
Issue 4 — Generate customer lookup MCP demo server

Owner: Alejandro
Goal: Use the demo case as the first generated server.

Acceptance criteria:

Tool name: customer_lookup_by_email.
Input: email.
Env vars: CUSTOMER_API_BASE_URL, CUSTOMER_API_TOKEN.
Suggested deps include MCP SDK.
Issue 5 — Add safe defaults to generated server

Owner: Alejandro
Goal: Make the generated template compliance-friendly.

Acceptance criteria:

No hardcoded secrets.
Uses process.env.
Validates email input.
Avoids raw PII logging.
Includes error handling.
Issue 6 — Add demo generation command

Owner: Alejandro
Goal: Allow local demo generation.

Acceptance criteria:

npm run generate:demo works.
Files are written to generated/customer-lookup-mcp.
Output can be inspected manually.
Issue 7 — Add Bob adapter

Owner: Alejandro
Goal: Add isolated IBM Bob integration.

Acceptance criteria:

BobClient exists.
Generator does not directly depend on Bob internals.
Mock/fallback mode exists.
Issue 8 — Add constrained Bob prompt

Owner: Alejandro
Goal: Make Bob return structured tool-specific JSON.

Acceptance criteria:

Bob prompt asks for JSON only.
Bob does not generate full project structure.
Bob returns schema, handlerCode, envVars, suggestedDeps, riskTags.
Issue 9 — Parse and validate Bob output

Owner: Alejandro
Goal: Normalize Bob response into generator contract.

Acceptance criteria:

Invalid JSON handled.
Missing fields handled.
Tool names sanitized.
Output always matches GenerateMcpServerOutput.
Issue 10 — Add auto fallback mode

Owner: Alejandro
Goal: Prevent demo failure if Bob fails.

Acceptance criteria:

template mode works.
bob mode works.
auto mode falls back.
warnings explain fallback reason.
8. Your Priority Order

Do it in this exact order:

1. types.ts
2. generateMcpServer.ts
3. templates/
4. demo.ts
5. generate:demo script
6. BobClient
7. buildBobPrompt
8. parseBobResponse
9. auto fallback mode
10. handoff to backend/compliance

The key decision: template first, Bob second.

That gives the team something usable immediately and avoids blocking frontend, backend, and compliance on IBM Bob access.
