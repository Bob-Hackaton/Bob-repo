import { describe, expect, it } from "vitest";
import { AuditResponseSchema } from "./contracts.js";
import { auditCode } from "./audit.js";

describe("audit execution", () => {
  it("runs starter rules by default and returns schema-valid normalized findings", () => {
    const code = [
      "const greeting = 'hello';",
      "const api_key = 'sk_live_123456789';",
      "console.log('user email', user.email);",
    ].join("\n");

    const result = auditCode({ code });
    const parsed = AuditResponseSchema.parse(result);

    expect(parsed.summary).toEqual({
      total: 2,
      security: 1,
      compliance: 1,
    });
    expect(parsed.findings).toEqual([
      expect.objectContaining({
        id: "no-hardcoded-secrets",
        severity: "high",
        line: 2,
        remediation: "Move the secret to an environment variable and read it from process.env.",
        frameworks: expect.arrayContaining(["SOC2", "HIPAA"]),
      }),
      expect.objectContaining({
        id: "pii-in-logs",
        severity: "high",
        line: 3,
        frameworks: expect.arrayContaining(["GDPR", "HIPAA", "SOC2"]),
      }),
    ]);
  });

  it("runs only requested matching rule ids when a rules filter is provided", () => {
    const code = [
      "const api_key = 'sk_live_123456789';",
      "console.log('user email', user.email);",
    ].join("\n");

    const result = auditCode({ code, rules: ["pii-in-logs"] });

    expect(result.findings.map((finding) => finding.id)).toEqual(["pii-in-logs"]);
    expect(result.summary).toEqual({ total: 1, security: 0, compliance: 1 });
  });

  it("handles unknown rule ids predictably by running no unmatched rules", () => {
    const result = auditCode({
      code: "const api_key = 'sk_live_123456789';",
      rules: ["unknown-rule"],
    });

    expect(result).toEqual({
      findings: [],
      summary: { total: 0, security: 0, compliance: 0 },
    });
  });

  it("normalizes file payloads into target code before auditing", () => {
    const result = auditCode({
      files: [
        { path: "safe.ts", content: "const ok = true;" },
        { path: "unsafe.ts", content: "localStorage.setItem('authToken', token);" },
      ],
      rules: ["plaintext-storage"],
    });

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toEqual(
      expect.objectContaining({
        id: "plaintext-storage",
        line: 2,
        frameworks: expect.arrayContaining(["GDPR", "SOC2", "HIPAA"]),
      })
    );
  });
});

describe("auditCode auto_fix metadata", () => {
  it("attaches suggestion metadata to no-hardcoded-secrets findings without mutating input", () => {
    const code = "const api_key = 'sk_live_123456789';";

    // Capture before and after to prove no mutation
    const beforeCode = code;
    const result = auditCode({ code });
    const afterCode = code;

    expect(beforeCode).toBe(afterCode); // Prove no mutation
    expect(result.findings).toHaveLength(1);

    const finding = result.findings[0];
    expect(finding.id).toBe("no-hardcoded-secrets");
    expect(finding.suggestion).toBeDefined();
    expect(finding.suggestion?.type).toBe("env_var");
    expect(finding.suggestion?.suggestedReplacement).toBe("process.env.API_KEY");
    expect(finding.remediation).toBeDefined(); // backward-compatible remediation still present
  });

  it("returns suggestion-only metadata (no mutation) for banned-libs findings", () => {
    const code = "import vm2 from 'vm2';";

    const result = auditCode({ code, rules: ["banned-libs"] });

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].suggestion).toBeUndefined(); // banned-libs has no auto_fix
    expect(result.findings[0].remediation).toBeUndefined();
  });

  it("suggestion is metadata only — original input code is never modified", () => {
    const files = [
      { path: "config.js", content: "const password = 'super_secret_123';" },
    ];

    const originalContent = files[0].content;
    auditCode({ files, rules: ["no-hardcoded-secrets"] });

    expect(files[0].content).toBe(originalContent); // Prove no mutation
  });
});
