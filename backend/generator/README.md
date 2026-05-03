# MCP Server Generator

Owner: **Alejandro**.

Takes a plain-English description and outputs a complete MCP server.

## Contract

**Input:**
```ts
{
  description: string;       // "Tool that searches Gmail"
  context?: object;          // Optional: env, auth hints, etc.
}
```

**Output:**
```ts
{
  files: { path: string; content: string }[];
  schema: object;            // The MCP tool schema
  metadata: {
    estimatedComplexity: 'low' | 'medium' | 'high';
    suggestedDeps: string[];
  }
}
```

## Day 1 goal
Hardcoded template. No Bob yet. Just prove the I/O works.

## Day 2 goal
Replace template with real Bob calls.
