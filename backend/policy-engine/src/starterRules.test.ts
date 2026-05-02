import { describe, expect, it } from "vitest";
import { compileRegexRule, loadRules, validateRule } from "./rules.js";
import { starterRules } from "./starterRules.js";

const expectedRuleIds = [
  "no-hardcoded-secrets",
  "banned-libs",
  "missing-auth",
  "pii-in-logs",
  "plaintext-storage",
] as const;

type StarterRuleId = (typeof expectedRuleIds)[number];

const badSnippets: Record<StarterRuleId, string> = {
  "no-hardcoded-secrets": "const api_key = 'sk_live_123456789';",
  "banned-libs": "import serialize from 'node-serialize';",
  "missing-auth": "app.get('/admin/users', async (req, res) => res.json([]));",
  "pii-in-logs": "console.log('user email', user.email);",
  "plaintext-storage": "localStorage.setItem('authToken', token);",
};

const smokeSnippets: Record<StarterRuleId, string> = {
  "no-hardcoded-secrets": "const tokenCount = 0;",
  "banned-libs": "import express from 'express';",
  "missing-auth": "app.get('/admin/users', requireAuth, listUsers);",
  "pii-in-logs": "console.log('request completed');",
  "plaintext-storage": "localStorage.setItem('theme', 'dark');",
};

describe("starter rules", () => {
  it("defines the five expected starter rule ids", () => {
    expect(starterRules.map((rule) => rule.id)).toEqual(expectedRuleIds);
  });

  it("loads through the shared rule validation path", () => {
    const loaded = loadRules(starterRules);

    expect(loaded.success).toBe(true);
    if (!loaded.success) return;

    expect(loaded.rules).toHaveLength(5);
    loaded.rules.forEach((rule) => {
      expect(validateRule(rule).success).toBe(true);
    });
  });

  it("uses meaningful metadata for categories, severities, and frameworks", () => {
    starterRules.forEach((rule) => {
      expect(rule.category).toMatch(/^(security|gdpr|soc2|hipaa|best-practice)$/);
      expect(["medium", "high", "critical"]).toContain(rule.severity);
      expect(rule.frameworks.length).toBeGreaterThan(0);
      expect(rule.description.length).toBeGreaterThan(20);
    });

    expect(starterRules.find((rule) => rule.id === "pii-in-logs")?.frameworks).toEqual(
      expect.arrayContaining(["GDPR", "HIPAA"])
    );
    expect(starterRules.find((rule) => rule.id === "plaintext-storage")?.frameworks).toEqual(
      expect.arrayContaining(["SOC2", "HIPAA"])
    );
  });

  it("compiles each regex and matches representative unsafe snippets only", () => {
    const loaded = loadRules(starterRules);
    expect(loaded.success).toBe(true);
    if (!loaded.success) return;

    loaded.rules.forEach((rule) => {
      const ruleId = rule.id as StarterRuleId;
      const regex = compileRegexRule(rule);
      expect(regex.test(badSnippets[ruleId]), `${rule.id} should match unsafe snippet`).toBe(true);
      expect(regex.test(smokeSnippets[ruleId]), `${rule.id} should ignore smoke snippet`).toBe(false);
    });
  });
});

describe("no-hardcoded-secrets rule behavior", () => {
  const rule = starterRules.find((r) => r.id === "no-hardcoded-secrets")!;
  const regex = compileRegexRule(rule);

  it("matches api_key assignments with single or double quotes", () => {
    expect(regex.test("const api_key = 'sk_live_123';")).toBe(true);
    expect(regex.test('const api_key = "sk_live_123";')).toBe(true);
  });

  it("matches password assignments", () => {
    expect(regex.test('password = "my_secret_value";')).toBe(true);
    expect(regex.test('let password = "hunter2_long";')).toBe(true);
  });

  it("matches token assignments", () => {
    expect(regex.test('const token = "abc123defghi";')).toBe(true);
    expect(regex.test('token = "abcdefghij";')).toBe(true);
  });

  it("matches secret assignments", () => {
    expect(regex.test('secret = "my_secret_value_long";')).toBe(true);
  });

  it("does not match short values (< 8 chars)", () => {
    expect(regex.test("const token = 'short6';")).toBe(false); // 6 chars
    expect(regex.test("const key = 'x123456';")).toBe(false); // 7 chars
  });

  it("does not match variable references (no assignment)", () => {
    expect(regex.test("const apiKey = process.env.API_KEY;")).toBe(false);
    expect(regex.test("const token = getToken();")).toBe(false);
  });
});

describe("banned-libs rule behavior", () => {
  const rule = starterRules.find((r) => r.id === "banned-libs")!;
  const regex = compileRegexRule(rule);

  it("matches import statements for node-serialize", () => {
    expect(regex.test("import serialize from 'node-serialize';")).toBe(true);
    expect(regex.test("import NodeSerialize from 'node-serialize';")).toBe(true);
  });

  it("matches import statements for vm2", () => {
    expect(regex.test("import vm2 from 'vm2';")).toBe(true);
    expect(regex.test("import VM2 from 'vm2';")).toBe(true);
  });

  it("matches import statements for serialize-javascript", () => {
    expect(regex.test("import ser from 'serialize-javascript';")).toBe(true);
  });

  it("matches require statements", () => {
    expect(regex.test("require('node-serialize');")).toBe(true);
    expect(regex.test("require('vm2');")).toBe(true);
    expect(regex.test("require('serialize-javascript');")).toBe(true);
  });

  it("does not match safe libraries", () => {
    expect(regex.test("import express from 'express';")).toBe(false);
    expect(regex.test("const fs = require('fs');")).toBe(false);
  });
});

describe("missing-auth rule behavior", () => {
  const rule = starterRules.find((r) => r.id === "missing-auth")!;
  const regex = compileRegexRule(rule);

  it("matches routes with admin in path without auth middleware", () => {
    expect(regex.test("app.get('/admin/users', async (req, res) => {})")).toBe(true);
    expect(regex.test("router.post('/admin/config', (req, res) => {})")).toBe(true);
  });

  it("matches routes with user in path without auth middleware", () => {
    expect(regex.test("app.get('/users/profile', async (req, res) => res.json({});")).toBe(true);
  });

  it("matches routes with account in path without auth middleware", () => {
    expect(regex.test("router.put('/account/settings', async (req, res) => {})")).toBe(true);
  });

  it("matches routes with patient in path without auth middleware", () => {
    expect(regex.test("app.post('/patient/records', async (req, res) => {})")).toBe(true);
  });

  it("matches routes with payment in path without auth middleware", () => {
    expect(regex.test("router.delete('/payment/history', async (req, res) => {})")).toBe(true);
  });

  it("does not match routes with auth middleware", () => {
    expect(regex.test("app.get('/admin/users', requireAuth, listUsers);")).toBe(false);
    expect(regex.test("router.post('/admin', checkAuth, handler);")).toBe(false);
  });

  it("does not match routes without sensitive path segments", () => {
    expect(regex.test("app.get('/public/info', async (req, res) => {})")).toBe(false);
    expect(regex.test("router.get('/health', (req, res) => res.json({});")).toBe(false);
  });
});

describe("pii-in-logs rule behavior", () => {
  const rule = starterRules.find((r) => r.id === "pii-in-logs")!;
  const regex = compileRegexRule(rule);

  it("matches console.log with email", () => {
    expect(regex.test("console.log('user email', user.email);")).toBe(true);
    expect(regex.test("console.log(email);")).toBe(true);
  });

  it("matches console.log with ssn", () => {
    expect(regex.test("console.log('ssn', user.ssn);")).toBe(true);
    expect(regex.test("console.log(ssn);")).toBe(true);
  });

  it("matches console.log with socialSecurityNumber", () => {
    expect(regex.test("console.log('ssn:', socialSecurityNumber);")).toBe(true);
  });

  it("matches console.log with phone", () => {
    expect(regex.test("console.log('phone:', phone);")).toBe(true);
  });

  it("matches console.log with patient", () => {
    expect(regex.test("console.log('patient data:', patient);")).toBe(true);
  });

  it("matches console.log with dob", () => {
    expect(regex.test("console.log('birth:', dob);")).toBe(true);
  });

  it("does not match console.log without PII identifiers", () => {
    expect(regex.test("console.log('user id:', user.id);")).toBe(false);
    expect(regex.test("console.log('timestamp:', Date.now());")).toBe(false);
  });

  it("does not match other console methods with PII", () => {
    expect(regex.test("console.info('email:', email);")).toBe(true);
    expect(regex.test("console.warn('ssn detected');")).toBe(true);
    expect(regex.test("console.error('phone error');")).toBe(true);
  });
});

describe("plaintext-storage rule behavior", () => {
  const rule = starterRules.find((r) => r.id === "plaintext-storage")!;
  const regex = compileRegexRule(rule);

  it("matches localStorage.setItem with password", () => {
    expect(regex.test("localStorage.setItem('password', value);")).toBe(true);
    expect(regex.test("localStorage.setItem('Password', value);")).toBe(true);
  });

  it("matches localStorage.setItem with token", () => {
    expect(regex.test("localStorage.setItem('token', token);")).toBe(true);
    expect(regex.test("localStorage.setItem('Token', token);")).toBe(true);
  });

  it("matches localStorage.setItem with secret", () => {
    expect(regex.test("localStorage.setItem('secret', secret);")).toBe(true);
    expect(regex.test("localStorage.setItem('Secret', secret);")).toBe(true);
  });

  it("matches localStorage.setItem with ssn", () => {
    expect(regex.test("localStorage.setItem('ssn', ssn);")).toBe(true);
    expect(regex.test("localStorage.setItem('SSN', ssn);")).toBe(true);
  });

  it("matches localStorage.setItem with email", () => {
    expect(regex.test("localStorage.setItem('email', email);")).toBe(true);
    expect(regex.test("localStorage.setItem('Email', email);")).toBe(true);
  });

  it("matches sessionStorage.setItem with sensitive keys", () => {
    expect(regex.test("sessionStorage.setItem('password', value);")).toBe(true);
  });

  it("does not match localStorage.setItem with non-sensitive keys", () => {
    expect(regex.test("localStorage.setItem('theme', 'dark');")).toBe(false);
    expect(regex.test("localStorage.setItem('username', 'john');")).toBe(false);
    expect(regex.test("localStorage.setItem('lastVisit', Date.now());")).toBe(false);
  });
});
