# MCP Server Generator — Day 2 Tasks
## Ownership
**Owner:** Alejandro
**Module:** backend/generator
**Purpose:** Convert a plain-English tool description into a complete MCP server project.

## 5. Day 2 Goal — Replace Template with Bob Calls
Day 2 objective: Replace template with real Bob calls.
Important: do not let Bob generate the entire project freely.
Bob generates the tool-specific logic (tool name, description, input schema, handler logic, env vars, risk tags, dependencies).
Generator owns the structure (package.json, Dockerfile, layout, README, wrapper).

## 6. Day 2 Tasks
- [ ] **Task 8 — Create Bob adapter**
  - Create: `backend/generator/src/bob/` (BobClient.ts, buildBobPrompt.ts, etc.)
  - Acceptance: BobClient isolated, works offline in template mode, failures caught.
- [ ] **Task 9 — Build constrained Bob prompt**
  - Prompt: Demand JSON only, structured with toolName, description, inputSchema, handlerCode, etc.
  - Acceptance: Structured JSON requested, safety constraints included.
- [ ] **Task 10 — Parse Bob response**
  - Validate: JSON, toolName, inputSchema, handlerCode, suggestedDeps, complexity.
  - Acceptance: Invalid output handled, missing fields caught, tool names sanitized.
- [ ] **Task 11 — Add generation modes**
  - Modes: `template` (offline), `bob` (online), `auto` (try Bob, fallback).
  - Acceptance: Template mode works, Bob mode uses Bob, Auto mode falls back safely.
- [ ] **Task 12 — Merge Bob output into templates**
  - Pipeline: description -> Bob prompt -> Bob JSON -> normalize -> insert into template.
  - Acceptance: Bob controls only tool parts, output matches contract.

## GitHub Issues (Day 2)
- **Issue 7 — Add Bob adapter**
- **Issue 8 — Add constrained Bob prompt**
- **Issue 9 — Parse and validate Bob output**
- **Issue 10 — Add auto fallback mode**

## Priority Order (Day 2)
6. `BobClient`
7. `buildBobPrompt`
8. `parseBobResponse`
9. `auto fallback mode`
10. `handoff to backend/compliance`
