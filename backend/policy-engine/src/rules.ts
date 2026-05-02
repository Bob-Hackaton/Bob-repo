import { z } from "zod";
import type { AuditFinding } from "./contracts.js";

export const RuleCategorySchema = z.enum([
  "security",
  "gdpr",
  "soc2",
  "hipaa",
  "performance",
  "best-practice",
]);

export const RuleSeveritySchema = z.enum(["low", "medium", "high", "critical"]);

export const RulePatternSchema = z.object({
  type: z.literal("regex"),
  expression: z.string().min(1),
});

export const RuleAutoFixSchema = z.object({
  type: z.literal("env_var"),
  template: z.string().min(1),
});

export const RuleSchema = z
  .object({
    id: z.string().min(1).superRefine((val, ctx) => {
      if (val.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          message: "id cannot be empty or whitespace",
          path: ["id"],
        });
      }
    }),
    category: RuleCategorySchema,
    severity: RuleSeveritySchema,
    frameworks: z.array(z.string().min(1)).min(1),
    description: z.string().min(1),
    pattern: RulePatternSchema,
    auto_fix: RuleAutoFixSchema.optional(),
  })
  .superRefine((rule, ctx) => {
    try {
      new RegExp(rule.pattern.expression);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid regex expression",
        path: ["pattern", "expression"],
      });
    }
  });

export type RuleCategory = z.infer<typeof RuleCategorySchema>;
export type RuleSeverity = z.infer<typeof RuleSeveritySchema>;
export type RulePattern = z.infer<typeof RulePatternSchema>;
export type RuleAutoFix = z.infer<typeof RuleAutoFixSchema>;
export type ComplianceRule = z.infer<typeof RuleSchema>;

export type RuleValidationResult =
  | { success: true; rule: ComplianceRule }
  | { success: false; errors: string[] };

export type RuleLoadResult =
  | { success: true; rules: ComplianceRule[] }
  | { success: false; errors: string[] };

function formatIssue(issue: z.ZodIssue, prefix?: string) {
  const path = issue.path.join(".");
  const qualifiedPath = [prefix, path].filter(Boolean).join(".");
  return qualifiedPath ? `${qualifiedPath}: ${issue.message}` : issue.message;
}

export function validateRule(input: unknown): RuleValidationResult {
  const parsed = RuleSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, rule: parsed.data };
  }

  return {
    success: false,
    errors: parsed.error.issues.map((issue) => formatIssue(issue)),
  };
}

export function loadRules(input: unknown): RuleLoadResult {
  if (!Array.isArray(input)) {
    return { success: false, errors: ["rules: Expected an array of rules"] };
  }

  const rules: ComplianceRule[] = [];
  const errors: string[] = [];

  input.forEach((candidate, index) => {
    const parsed = RuleSchema.safeParse(candidate);
    if (parsed.success) {
      rules.push(parsed.data);
      return;
    }

    errors.push(
      ...parsed.error.issues.map((issue) => formatIssue(issue, `rules[${index}]`))
    );
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, rules };
}

export function compileRegexRule(rule: ComplianceRule): RegExp {
  return new RegExp(rule.pattern.expression);
}

/**
 * Creates an auto-fix suggestion from a rule and match text.
 * Returns null if the rule has no auto_fix metadata.
 * The suggestion is deterministic: extracts the key name, converts to UPPER_SNAKE_CASE,
 * and suggests `process.env.{UPPER_SNAKE_KEY}`. Never suggests the actual secret value.
 */
export function createAutoFixSuggestion(
  rule: ComplianceRule,
  _matchText: string
): { type: "env_var"; suggestedReplacement: string } | null {
  if (!rule.auto_fix || rule.auto_fix.type !== "env_var") {
    return null;
  }

  // Extract the variable/key name from the match text
  // Pattern: word characters (for key name) followed by optional whitespace, = or :, then the value
  // We use a simple approach: find the first identifier pattern before = or :
  const keyNameMatch = _matchText.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]/);
  const keyName = keyNameMatch ? keyNameMatch[1] : null;

  // Convert to UPPER_SNAKE_CASE
  const upperSnake = keyName
    ? keyName
        .replace(/([a-z])([A-Z])/g, "$1_$2")          // camelCase to snake_case
        .replace(/[\s-]+/g, "_")                      // spaces/hyphens to underscores
        .toUpperCase()
    : "SECRET";

  return {
    type: "env_var",
    suggestedReplacement: `process.env.${upperSnake}`,
  };
}

export function createFindingFromRule(
  rule: ComplianceRule,
  metadata: { line?: number; suggestion?: { type: "env_var"; suggestedReplacement: string } | null } = {}
): AuditFinding {
  return {
    id: rule.id,
    category: rule.category,
    severity: rule.severity,
    description: rule.description,
    ...(metadata.line === undefined ? {} : { line: metadata.line }),
    ...(rule.auto_fix ? { remediation: rule.auto_fix.template } : {}),
    ...(metadata.suggestion ? { suggestion: metadata.suggestion } : {}),
    frameworks: [...rule.frameworks],
  };
}
