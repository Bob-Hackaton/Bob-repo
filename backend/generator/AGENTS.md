# 🤖 Agent Skills - Bob MCP Forge

> **Deterministic Skill Sync**: This file is automatically updated via `synck`. Do not edit the auto-invoke table manually.

Welcome to the **Bob MCP Forge** agent ecosystem. This document tracks all available skills, their triggers, and the project standards that govern our development flow.

---

### ⚡ Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST. These are handled automatically by the **Skill Sync** protocol.

| Action | Skill |
| :--- | :--- |
| After creating/modifying a skill | `skill-sync` |
| Auditing generated code for GDPR, SOC2, or HIPAA compliance | `security-compliance-audit` |
| Creating a new MCP server project or scaffold | `typescript-mcp-server-generator` |
| Creating new skills | `skill-creator` |
| Regenerate AGENTS.md Auto-invoke tables (sync.sh) | `skill-sync` |
| Scaffolding new backend modules or file structures | `scaffold` |
| Searching for or installing new agent skills | `find-skills` |
| Troubleshoot why a skill is missing from AGENTS.md auto-invoke | `skill-sync` |

---

### 🛠️ Manual Skills (Global)

These skills are available globally and should be used to maintain consistency across the project.

| Trigger | Skill | Description |
| :--- | :--- | :--- |
| `open pr`, `submit changes` | `branch-pr` | PR creation workflow and issue-first enforcement. |
| `fix bug`, `new issue` | `issue-creation` | GitHub issue creation and tracking. |
| `review`, `juzgar` | `judgment-day` | Parallel adversarial review protocol for zero-bug delivery. |
| `sdd`, `plan change` | `sdd-*` | Spec-Driven Development workflow (Explore, Propose, Spec, Design, Tasks, Apply, Verify). |

---

### ⚖️ Project Standards

These rules are non-negotiable and apply to all agents working on this codebase.

- **Conventional Commits**: Never add AI attribution. Use `type(scope): description`.
- **Security-First**: All generated code must be audited via the Sovereign Compliance Agent.
- **No Build**: Never build after changes unless explicitly requested by the user.
- **SDD Workflow**: Use Engram persistence for architectural decisions and changes.
- **Strict TDD**: Follow the TDD cycle (Red -> Green -> Refactor) when implementing logic.

---

*Last synced: 2026-05-01*
