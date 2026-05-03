/**
 * MCP Server Generator - Type Contracts
 * Defines the input/output types for the generateMcpServer function.
 */

export interface GenerateMcpServerInput {
  description: string;
  context?: {
    env?: Record<string, string>;
    authHints?: string[];
    complianceProfile?: 'general' | 'gdpr' | 'soc2' | 'hipaa';
    preferredLanguage?: 'typescript';
    deploymentTarget?: 'ibm-code-engine';
  };
}

export interface GenerateMcpServerOutput {
  files: {
    path: string;
    content: string;
  }[];
  schema: object;
  metadata: {
    estimatedComplexity: 'low' | 'medium' | 'high';
    suggestedDeps: string[];
    toolName: string;
    projectName: string;
    envVars: string[];
    riskTags: string[];
    generationMode: 'template' | 'bob' | 'fallback';
    warnings: string[];
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
}

export interface McpServerSchema {
  name: string;
  description: string;
  tools: ToolDefinition[];
}

export interface TemplateContext {
  toolName: string;
  projectName: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  envVars: string[];
  complianceProfile?: string;
}