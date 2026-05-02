# Usage Manual: MCP Server Generator

This manual provides a comprehensive guide on operating the MCP Server Generator and integrating the resulting servers into your LLM workflows.

---

## 🚀 Quick Start Checklist
1. [ ] **Setup**: `cd backend/generator && npm install`
2. [ ] **Configure Bob (Optional)**: Set `BOB_API_KEY` to enable agentic generation.
3. [ ] **Generate**: `npm run generate:demo`
4. [ ] **Prepare Product**: `cd generated/customer-lookup-mcp && npm install && npm run build`
5. [ ] **Connect**: Add the server to your `mcp_config.json` (Local) or use the SSE URL (Cloud).

---

## 1. Core Concept: Factory vs. Product

It is important to distinguish between the two components of this module:

| Component | Role | Location |
|-----------|------|----------|
| **The Generator** | The "Factory" that creates new servers. | `backend/generator/` |
| **The Generated Server** | The "Product" (an actual MCP server). | `backend/generator/generated/` |

---

## 2. Setting Up the Generator (The Factory)

Before generating any servers, ensure your environment is ready.

```bash
cd backend/generator
npm install
```

### 🤖 IBM Bob Integration (Agentic Generation)
The generator uses **IBM Bob** to dynamically implement tool logic.

| Variable | Description | Default |
|----------|-------------|---------|
| `BOB_API_KEY` | Your IBM Bob / watsonx.ai API Key. | (Required for AI) |
| `BOB_ENABLED` | Set to `false` to force deterministic fallback. | `true` |

If no API key is provided, the generator automatically falls back to **Deterministic Templates**, ensuring you always get a functional project.

---

## 3. Creating a New MCP Server

The generator creates a complete, standalone TypeScript project based on your requirements.

### Run the Demo Generator
```bash
npm run generate:demo
```

### Output Location
The new project will be created in:
`backend/generator/generated/customer-lookup-mcp/`

---

## 4. Preparing the Generated Server (The Product)

Every generated server is a standalone Node.js project. You must initialize it before use.

```bash
cd generated/customer-lookup-mcp
npm install
npm run build
```

### Local Testing (Development Mode)
You can run the server in development mode to see it in action:
```bash
npm run dev
```

### Testing with MCP Inspector
Use the official MCP Inspector to validate your server tools:
```bash
npx @modelcontextprotocol/inspector npm run dev
```

---

## 5. Connecting to an MCP Host

To use your tool, you must register the generated server with an MCP Host (like **Antigravity**, **Claude Desktop**, or **Cursor**).

### Option A: Local Connection (Standard)
Generated servers use the `stdio` transport by default.

1. **Get Absolute Path**: Find the full path to your `dist/server.js`.
   *   *Example (Windows):* `C:/Users/name/projects/backend/generator/generated/customer-lookup-mcp/dist/server.js`

2. **Update Configuration**: Add the server to your config file.

**Antigravity / Generic Config (`mcp_config.json`):**
```json
{
  "mcpServers": {
    "customer-lookup": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/dist/server.js"],
      "env": { "NODE_ENV": "production" }
    }
  }
}
```

---

## 6. Cloud Deployment (IBM Code Engine)

For production, you can deploy the server as a container.

### Step 1: Containerize
Use the generated `Dockerfile` in the product folder.
```bash
docker build -t mcp-server-custom .
```

### Step 2: Deploy to IBM Code Engine
1. Upload your image to a registry (e.g., IBM Cloud Container Registry).
2. Create a new "Application" in **IBM Code Engine**.
3. Enable "Public Endpoint".

---

## 7. Security & Best Practices

The generator automatically implements these "Zero-Trust" patterns:

- **Validation Gates**: AI-generated code passes through schema and security scanners.
- **Environment Isolation**: No secrets are stored in code.
- **Zod Validation**: All tool inputs are strictly validated against a schema.
- **PII Protection**: Logging logic masks sensitive data (like emails or IDs).
- **Graceful Timeouts**: Operations are capped to prevent resource exhaustion.

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Use `--legacy-peer-deps` (Windows/Peer issues). |
| `Command not found` | Ensure you ran `npm run build` in the **product** folder. |
| Host can't find server | Always use **absolute paths** in your JSON config. |
| Tool doesn't appear | Check the Host logs (Claude Desktop logs are in `%APPDATA%\Claude\logs`). |