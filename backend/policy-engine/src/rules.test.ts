import { describe, expect, it } from "vitest";
import {
  RuleSchema,
  compileRegexRule,
  createAutoFixSuggestion,
  createFindingFromRule,
  loadRules,
  validateRule,
} from "./rules.js";
import { starterRules } from "./starterRules.js";

const regexRule = {
  id: "no-hardcoded-secrets",
  category: "security",
  severity: "high",
  frameworks: ["SOC2", "HIPAA"],
  description: "Detects hardcoded API keys, passwords, tokens",
  pattern: {
    type: "regex",
    expression: "(api[_-]?key|password|token)\\s*=\\s*['\"][^'\"]+['\"]",
  },
  auto_fix: {
    type: "env_var",
    template: "process.env.{NAME}",
  },
} as const;

describe("rule schema", () => {
  it("accepts the README regex rule shape", () => {
    expect(() => RuleSchema.parse(regexRule)).not.toThrow();
  });

  it("rejects invalid regex expressions with a clean field error", () => {
    const result = validateRule({
      ...regexRule,
      pattern: { type: "regex", expression: "(" },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("pattern.expression: Invalid regex expression");
    }
  });
});

describe("rule loading", () => {
  it("loads and validates multiple rules", () => {
    const result = loadRules([regexRule, { ...regexRule, id: "no-plain-password" }]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.rules).toHaveLength(2);
      expect(result.rules[0].pattern.type).toBe("regex");
    }
  });

  it("reports the failing rule index when a rule cannot be loaded", () => {
    const result = loadRules([regexRule, { ...regexRule, id: "broken", pattern: { type: "regex", expression: "[" } }]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toBe("rules[1].pattern.expression: Invalid regex expression");
    }
  });
});

describe("regex rule support", () => {
  it("compiles validated regex rule patterns", () => {
    const valid = validateRule(regexRule);
    expect(valid.success).toBe(true);
    if (!valid.success) return;

    const pattern = compileRegexRule(valid.rule);
    expect(pattern.test("const api_key = 'secret';")).toBe(true);
    expect(pattern.test("const greeting = 'hello';")).toBe(false);
  });
});

describe("finding metadata", () => {
  it("derives audit finding metadata from a matched rule", () => {
    const valid = validateRule(regexRule);
    expect(valid.success).toBe(true);
    if (!valid.success) return;

    expect(createFindingFromRule(valid.rule, { line: 7 })).toEqual({
      id: "no-hardcoded-secrets",
      category: "security",
      severity: "high",
      description: "Detects hardcoded API keys, passwords, tokens",
      line: 7,
      remediation: "process.env.{NAME}",
      frameworks: ["SOC2", "HIPAA"],
    });
  });
});

describe("createAutoFixSuggestion", () => {
  it("returns env_var suggestion with deterministic env var name for no-hardcoded-secrets", () => {
    const rule = starterRules.find((r) => r.id === "no-hardcoded-secrets")!;
    const matchText = "api_key = 'sk_live_123456789'";

    const suggestion = createAutoFixSuggestion(rule, matchText);

    expect(suggestion).not.toBeNull();
    expect(suggestion?.type).toBe("env_var");
    expect(suggestion?.suggestedReplacement).toBe("process.env.API_KEY");
  });

  it("returns null when rule has no auto_fix", () => {
    const rule = starterRules.find((r) => r.id === "banned-libs")!;
    const matchText = "require('node-serialize')";

    const suggestion = createAutoFixSuggestion(rule, matchText);

    expect(suggestion).toBeNull();
  });

  it("does not extract or suggest the secret value itself", () => {
    const rule = starterRules.find((r) => r.id === "no-hardcoded-secrets")!;
    const matchText = "password = 'my_secret_password_123'";

    const suggestion = createAutoFixSuggestion(rule, matchText);

    expect(suggestion).not.toBeNull();
    expect(suggestion?.suggestedReplacement).not.toContain("my_secret_password_123");
    expect(suggestion?.suggestedReplacement).toContain("process.env.PASSWORD");
  });

  it("converts key names to UPPER_SNAKE_CASE for env var convention", () => {
    const rule = starterRules.find((r) => r.id === "no-hardcoded-secrets")!;

    expect(createAutoFixSuggestion(rule, "authToken = 'abc'")?.suggestedReplacement).toBe("process.env.AUTH_TOKEN");
    expect(createAutoFixSuggestion(rule, "apiKey = 'abc'")?.suggestedReplacement).toBe("process.env.API_KEY");
    expect(createAutoFixSuggestion(rule, "secret = 'abc'")?.suggestedReplacement).toBe("process.env.SECRET");
  });

  it("returns null for rules without auto_fix metadata", () => {
    const rule = starterRules.find((r) => r.id === "missing-auth")!;
    const matchText = "router.get('/admin/users', async (req, res) => {})";

    const suggestion = createAutoFixSuggestion(rule, matchText);

    expect(suggestion).toBeNull();
  });
});

describe("rule validation edge cases", () => {
  it("rejects rules with missing required fields", () => {
    const result = validateRule({});

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("id"))).toBe(true);
  });

  it("rejects rules with invalid category", () => {
    const result = validateRule({
      id: "test-rule",
      category: "invalid-category",
      severity: "high",
      frameworks: [],
      description: "Test",
      pattern: { type: "regex", expression: "test" },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("category"))).toBe(true);
  });

  it("rejects rules with invalid severity", () => {
    const result = validateRule({
      id: "test-rule",
      category: "security",
      severity: "invalid-severity",
      frameworks: [],
      description: "Test",
      pattern: { type: "regex", expression: "test" },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("severity"))).toBe(true);
  });

  it("rejects rules with empty frameworks array", () => {
    const result = validateRule({
      id: "test-rule",
      category: "security",
      severity: "high",
      frameworks: [],
      description: "Test",
      pattern: { type: "regex", expression: "test" },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("frameworks"))).toBe(true);
  });

  it("rejects rules with invalid auto_fix type", () => {
    const result = validateRule({
      id: "test-rule",
      category: "security",
      severity: "high",
      frameworks: ["SOC2"],
      description: "Test",
      pattern: { type: "regex", expression: "test" },
      auto_fix: { type: "invalid-type", template: "test" },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("auto_fix"))).toBe(true);
  });

  it("accepts rules with optional auto_fix missing", () => {
    const ruleWithoutAutoFix = {
      id: "banned-libs",
      category: "security",
      severity: "high",
      frameworks: ["SOC2"],
      description: "Detects banned libraries",
      pattern: { type: "regex", expression: String.raw`require\('vm2'\)` },
    };

    const result = validateRule(ruleWithoutAutoFix);
    expect(result.success).toBe(true);
  });

  it("reports all errors when multiple fields are invalid", () => {
    const result = validateRule({
      id: "",
      category: "invalid",
      severity: "invalid",
      frameworks: [],
      description: "",
      pattern: { type: "regex", expression: "(" },
    });

    expect(result.success).toBe(false);
    // Should collect multiple errors (not fail on first)
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("validates rule id is not just whitespace", () => {
    const result = validateRule({
      id: "   ",
      category: "security",
      severity: "high",
      frameworks: ["SOC2"],
      description: "Test",
      pattern: { type: "regex", expression: "test" },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("id"))).toBe(true);
  });

  it("validates description is not empty string", () => {
    const result = validateRule({
      id: "test-rule",
      category: "security",
      severity: "high",
      frameworks: ["SOC2"],
      description: "",
      pattern: { type: "regex", expression: "test" },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("description"))).toBe(true);
  });
});
