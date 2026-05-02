import { runServer } from "./server.js";

runServer().catch((error) => {
  console.error("Fatal error in Policy Engine MCP server:", error);
  process.exit(1);
});
