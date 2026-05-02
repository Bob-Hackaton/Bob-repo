import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { auditCode } from "./audit.js";
import { AuditRequestSchema, AuditResponseSchema, type AuditRequest } from "./contracts.js";

/**
 * Pure handler for the audit tool to enable direct testing.
 * @param params - Validated audit request parameters
 */
export async function auditHandler(params: AuditRequest) {
  const structuredContent = auditCode(params);
  const findingLabel = structuredContent.summary.total === 1 ? "finding" : "findings";

  return {
    content: [
      {
        type: "text" as const,
        text: `Policy Engine: Audit complete with ${structuredContent.summary.total} ${findingLabel}.`,
      },
    ],
    structuredContent,
  };
}

/**
 * Sovereign Compliance Agent - MCP Server
 */
export function createPolicyEngineServer() {
  const server = new McpServer({
    name: "policy-engine",
    version: "0.1.0",
  });

  // Register the audit tool using the current registerTool API
  server.registerTool(
    "audit",
    {
      description: "Audits code for security and compliance issues (secrets, PII, auth, etc.)",
      inputSchema: AuditRequestSchema,
      outputSchema: AuditResponseSchema,
    },
    auditHandler
  );

  return server;
}

/**
 * Main entry point for the MCP server using Stdio transport
 */
export async function runServer() {
  const server = createPolicyEngineServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Policy Engine MCP server running on stdio");
}
