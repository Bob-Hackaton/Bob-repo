# Policy Engine Tasklist

## Goal
Build the Sovereign Compliance Agent as a reusable MCP server that audits generated MCP server code for security and compliance issues.

## Tasks

### 1. MCP server foundation
- [ ] Initialize the policy engine package structure.
- [ ] Add MCP server entrypoint and transport configuration.
- [ ] Register an `audit` tool exposed through MCP.
- [ ] Define input/output contracts for audit requests and findings.

### 2. Rule system
- [ ] Implement the rule schema from `README.md`.
- [ ] Add rule loading and validation.
- [ ] Support regex-based rules first.
- [ ] Add severity, category, and framework metadata to findings.

### 3. Starter rules
- [ ] Add `no-hardcoded-secrets` rule.
- [ ] Add `banned-libs` rule.
- [ ] Add `missing-auth` rule.
- [ ] Add `pii-in-logs` rule.
- [ ] Add `plaintext-storage` rule.

### 4. Audit execution
- [ ] Parse submitted code or file payloads.
- [ ] Run all enabled rules against the target code.
- [ ] Return normalized findings with rule id, severity, location, and remediation guidance.
- [ ] Include framework mapping for GDPR, SOC2, and HIPAA where relevant.

### 5. Auto-fix groundwork
- [ ] Model `auto_fix` metadata from the rule schema.
- [ ] Implement environment-variable replacement suggestions for secret findings.
- [ ] Keep fixes opt-in; never mutate code unless explicitly requested.

### 6. Tests and validation
- [ ] Add unit tests for rule validation.
- [ ] Add unit tests for each starter rule.
- [ ] Add integration test for the `audit` MCP tool.
- [ ] Document how to run policy-engine tests.

### 7. Documentation
- [ ] Expand `README.md` with setup instructions.
- [ ] Document the `audit` tool request/response format.
- [ ] Document how to add new compliance rules.
- [ ] Add examples for security, GDPR, SOC2, and HIPAA findings.
