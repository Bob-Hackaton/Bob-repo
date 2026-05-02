import { z } from "zod";

export const AuditFilePayloadSchema = z.object({
  path: z.string().min(1).describe("Original file path for a submitted code payload"),
  content: z.string().describe("Source code content for the file"),
});

/**
 * Audit request input
 */
export const AuditRequestSchema = z.object({
  code: z.string().optional().describe("The source code to audit for compliance and security issues"),
  files: z.array(AuditFilePayloadSchema).optional().describe("Optional file payloads to audit"),
  rules: z.array(z.string()).optional().describe("Optional list of specific rule IDs to run"),
});

export type AuditRequest = z.infer<typeof AuditRequestSchema>;
export type AuditFilePayload = z.infer<typeof AuditFilePayloadSchema>;

/**
 * Auto-fix suggestion for a finding (metadata only — never mutates code)
 */
export const AuditSuggestionSchema = z.object({
  type: z.literal("env_var"),
  suggestedReplacement: z.string().describe("The suggested env-var replacement expression"),
});

export type AuditSuggestion = z.infer<typeof AuditSuggestionSchema>;

/**
 * A single compliance finding
 */
export const AuditFindingSchema = z.object({
  id: z.string().describe("Unique identifier for the rule triggered"),
  category: z.enum(["security", "gdpr", "soc2", "hipaa", "performance", "best-practice"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string(),
  line: z.number().optional(),
  remediation: z.string().optional().describe("Suggested fix for the issue"),
  suggestion: AuditSuggestionSchema.optional().describe("Auto-fix metadata: env-var replacement suggestion"),
  frameworks: z.array(z.string()).optional().describe("Compliance frameworks this finding relates to (e.g. GDPR, SOC2)"),
});

export type AuditFinding = z.infer<typeof AuditFindingSchema>;

/**
 * Audit response output
 */
export const AuditResponseSchema = z.object({
  findings: z.array(AuditFindingSchema),
  summary: z.object({
    total: z.number(),
    security: z.number(),
    compliance: z.number(),
  }),
});

export type AuditResponse = z.infer<typeof AuditResponseSchema>;
