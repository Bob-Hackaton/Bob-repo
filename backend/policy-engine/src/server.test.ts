import { describe, it, expect } from "vitest";
import { AuditResponseSchema } from "./contracts.js";
import { createPolicyEngineServer, runServer, auditHandler } from "./server.js";

describe("Policy Engine MCP Server Foundation", () => {
  describe("auditHandler", () => {
    it("returns the expected structured output and text content", async () => {
      const code = "const api_key = 'sk_live_123456789';";
      const result = await auditHandler({ code });

      // Verify text content
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Audit complete");
      expect(result.content[0].text).toContain("1 finding");

      // Verify structured content against the exported contract
      const parsedOutput = AuditResponseSchema.parse(result.structuredContent);
      expect(parsedOutput.findings).toHaveLength(1);
      expect(parsedOutput.findings[0]).toEqual(
        expect.objectContaining({
          id: "no-hardcoded-secrets",
          line: 1,
          frameworks: expect.arrayContaining(["SOC2", "HIPAA"]),
        })
      );
      expect(parsedOutput.summary).toEqual({
        total: 1,
        security: 1,
        compliance: 0,
      });
    });

    it("validates against AuditResponseSchema for multi-finding responses", async () => {
      const code = [
        "const api_key = 'sk_live_abcdefgh';",
        "console.log('user email', user.email);",
      ].join("\n");

      const result = await auditHandler({ code });
      const parsed = AuditResponseSchema.parse(result.structuredContent);

      expect(parsed.findings).toHaveLength(2);
      expect(parsed.summary.total).toBe(2);
      expect(parsed.summary.security).toBe(1);
      expect(parsed.summary.compliance).toBe(1);
    });

    it("validates against AuditResponseSchema for empty findings", async () => {
      const code = "const greeting = 'hello';";

      const result = await auditHandler({ code });
      const parsed = AuditResponseSchema.parse(result.structuredContent);

      expect(parsed.findings).toHaveLength(0);
      expect(parsed.summary.total).toBe(0);
      expect(parsed.summary.security).toBe(0);
      expect(parsed.summary.compliance).toBe(0);
    });

    it("accepts rules filter and returns schema-valid filtered results", async () => {
      const code = [
        "const api_key = 'sk_live_abcdefgh';",
        "console.log('user email', user.email);",
      ].join("\n");

      const result = await auditHandler({ code, rules: ["pii-in-logs"] });
      const parsed = AuditResponseSchema.parse(result.structuredContent);

      expect(parsed.findings).toHaveLength(1);
      expect(parsed.findings[0].id).toBe("pii-in-logs");
      expect(parsed.summary.total).toBe(1);
    });

    it("accepts files payload and returns schema-valid findings across files", async () => {
      const result = await auditHandler({
        files: [
          { path: "safe.ts", content: "const ok = true;" },
          { path: "unsafe.ts", content: "localStorage.setItem('authToken', token);" },
        ],
      });

      const parsed = AuditResponseSchema.parse(result.structuredContent);
      expect(parsed.findings).toHaveLength(1);
      expect(parsed.findings[0].id).toBe("plaintext-storage");
    });

    it("returns structured content with suggestion metadata for auto-fixable findings", async () => {
      const result = await auditHandler({ code: "const api_key = 'sk_live_abcdefgh';" });
      const parsed = AuditResponseSchema.parse(result.structuredContent);

      const finding = parsed.findings[0];
      expect(finding.suggestion).toBeDefined();
      expect(finding.suggestion?.type).toBe("env_var");
      expect(finding.suggestion?.suggestedReplacement).toBe("process.env.API_KEY");
    });

    it("produces backward-compatible text content even when structured content has suggestions", async () => {
      const result = await auditHandler({ code: "const api_key = 'sk_live_abcdefgh';" });

      expect(result.content[0].text).toContain("Audit complete");
      expect(result.content[0].text).toContain("1 finding");
    });
  });

  describe("Server Registration", () => {
    it("creates a server instance", () => {
      const server = createPolicyEngineServer();
      expect(server).toBeDefined();
    });

    it("has a runnable server function", () => {
      expect(typeof runServer).toBe("function");
    });
  });
});
