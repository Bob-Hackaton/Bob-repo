import { AuditResponseSchema, type AuditResponse } from "./contracts.js";
import { createAutoFixSuggestion, createFindingFromRule, type ComplianceRule } from "./rules.js";
import { starterRules } from "./starterRules.js";

export type AuditFilePayload = {
  path: string;
  content: string;
};

export type AuditCodeInput = {
  code?: string;
  files?: AuditFilePayload[];
  rules?: string[];
  ruleSet?: ComplianceRule[];
};

function normalizeTargetCode({ code, files }: Pick<AuditCodeInput, "code" | "files">): string {
  const fileCode = files?.map((file) => file.content).join("\n") ?? "";
  return [code, fileCode].filter((part): part is string => Boolean(part)).join("\n");
}

function selectRules(ruleSet: ComplianceRule[], requestedRuleIds?: string[]): ComplianceRule[] {
  if (requestedRuleIds === undefined) {
    return ruleSet;
  }

  const requested = new Set(requestedRuleIds);
  return ruleSet.filter((rule) => requested.has(rule.id));
}

function lineForMatch(source: string, matchIndex: number): number {
  let line = 1;

  for (let index = 0; index < matchIndex; index += 1) {
    if (source[index] === "\n") {
      line += 1;
    }
  }

  return line;
}

function executableRegex(rule: ComplianceRule): RegExp {
  return new RegExp(rule.pattern.expression, "g");
}

function countComplianceFindings(findings: AuditResponse["findings"]): number {
  return findings.filter((finding) => ["gdpr", "soc2", "hipaa"].includes(finding.category)).length;
}

export function auditCode(input: AuditCodeInput): AuditResponse {
  const targetCode = normalizeTargetCode(input);
  const rules = selectRules(input.ruleSet ?? starterRules, input.rules);
  const findings = rules.flatMap((rule) => {
    const regex = executableRegex(rule);
    const ruleFindings: AuditResponse["findings"] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(targetCode)) !== null) {
      const suggestion = createAutoFixSuggestion(rule, match[0]);
      ruleFindings.push(
        createFindingFromRule(rule, {
          line: lineForMatch(targetCode, match.index),
          suggestion,
        })
      );

      if (match[0].length === 0) {
        regex.lastIndex += 1;
      }
    }

    return ruleFindings;
  });

  return AuditResponseSchema.parse({
    findings,
    summary: {
      total: findings.length,
      security: findings.filter((finding) => finding.category === "security").length,
      compliance: countComplianceFindings(findings),
    },
  });
}
