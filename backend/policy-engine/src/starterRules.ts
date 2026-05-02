import type { ComplianceRule } from "./rules.js";

export const starterRules: ComplianceRule[] = [
  {
    id: "no-hardcoded-secrets",
    category: "security",
    severity: "high",
    frameworks: ["SOC2", "HIPAA"],
    description: "Detects hardcoded API keys, passwords, tokens, or secrets assigned inline.",
    pattern: {
      type: "regex",
      expression: String.raw`\b(?:api[_-]?key|password|token|secret)\b\s*[:=]\s*['"][^'"]{8,}['"]`,
    },
    auto_fix: {
      type: "env_var",
      template: "Move the secret to an environment variable and read it from process.env.",
    },
  },
  {
    id: "banned-libs",
    category: "security",
    severity: "high",
    frameworks: ["SOC2"],
    description: "Detects imports or requires of libraries with unsafe serialization or sandbox escape risk.",
    pattern: {
      type: "regex",
      expression: String.raw`(?:import\s+[^;]*\sfrom\s*['"](?:node-serialize|vm2|serialize-javascript)['"]|require\(\s*['"](?:node-serialize|vm2|serialize-javascript)['"]\s*\))`,
    },
  },
  {
    id: "missing-auth",
    category: "best-practice",
    severity: "medium",
    frameworks: ["SOC2", "HIPAA"],
    description: "Detects sensitive route handlers that appear to be registered without auth middleware.",
    pattern: {
      type: "regex",
      expression: String.raw`(?:app|router)\.(?:get|post|put|delete|patch)\s*\(\s*['"][^'"]*\b(?:admin|user|account|profile|patient|payment)[^'"]*['"]\s*,\s*(?:async\s*)?\([^)]*\)\s*=>`,
    },
  },
  {
    id: "pii-in-logs",
    category: "gdpr",
    severity: "high",
    frameworks: ["GDPR", "HIPAA", "SOC2"],
    description: "Detects direct logging of common PII or PHI identifiers such as email, SSN, phone, or patient data.",
    pattern: {
      type: "regex",
      expression: String.raw`console\.(?:log|info|warn|error)\s*\([^)]*\b(?:email|ssn|socialSecurityNumber|phone|patient|dob)\b[^)]*\)`,
    },
  },
  {
    id: "plaintext-storage",
    category: "security",
    severity: "high",
    frameworks: ["SOC2", "HIPAA", "GDPR"],
    description: "Detects sensitive values being written to browser storage where data is stored in plaintext.",
    pattern: {
      type: "regex",
      expression: String.raw`(?:localStorage|sessionStorage)\.setItem\s*\(\s*['"][^'"]*(?:password|Password|token|Token|secret|Secret|ssn|SSN|email|Email)[^'"]*['"]`,
    },
  },
];
