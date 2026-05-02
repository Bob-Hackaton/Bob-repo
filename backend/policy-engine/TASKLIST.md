# Policy Engine Tasklist

## Goal
Build the Sovereign Compliance Agent as a reusable MCP server that audits generated MCP server code for security and compliance issues.

## Tasks

### 1. MCP server foundation
- [x] Initialize the policy engine package structure.
- [x] Add MCP server entrypoint and transport configuration.
- [x] Register an `audit` tool exposed through MCP.
- [x] Define input/output contracts for audit requests and findings.

### 2. Rule system
- [x] Implement the rule schema from `README.md`.
- [x] Add rule loading and validation.
- [x] Support regex-based rules first.
- [x] Add severity, category, and framework metadata to findings.

### 3. Starter rules
- [x] Add `no-hardcoded-secrets` rule.
- [x] Add `banned-libs` rule.
- [x] Add `missing-auth` rule.
- [x] Add `pii-in-logs` rule.
- [x] Add `plaintext-storage` rule.

### 4. Audit execution
- [x] Parse submitted code or file payloads.
- [x] Run all enabled rules against the target code.
- [x] Return normalized findings with rule id, severity, location, and remediation guidance.
- [x] Include framework mapping for GDPR, SOC2, and HIPAA where relevant.

### 5. Auto-fix groundwork
- [x] Model `auto_fix` metadata from the rule schema.
- [x] Implement environment-variable replacement suggestions for secret findings.
- [x] Keep fixes opt-in; never mutate code unless explicitly requested.

### 6. Tests and validation
- [x] Add unit tests for rule validation.
- [x] Add unit tests for each starter rule.
- [x] Add integration test for the `audit` MCP tool.
- [x] Document how to run policy-engine tests.

### 7. Documentation
- [x] Expand `README.md` with setup instructions.
- [x] Document the `audit` tool request/response format.
- [x] Document how to add new compliance rules.
- [x] Add examples for security, GDPR, SOC2, and HIPAA findings.