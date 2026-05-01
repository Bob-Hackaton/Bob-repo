/**
 * Demo - Generate customer lookup MCP server
 * Creates: generated/customer-lookup-mcp/
 */
import { generateMcpServer } from './generateMcpServer.js';
import fs from 'node:fs';
import path from 'node:path';

const DEMO_DESCRIPTION = 'Tool that looks up customer records by email';
const OUTPUT_DIR = 'generated/customer-lookup-mcp';

async function runDemo(): Promise<void> {
  console.error('🔧 Generating MCP server demo...');
  console.error(`   Description: ${DEMO_DESCRIPTION}`);
  console.error(`   Output: ${OUTPUT_DIR}`);

  try {
    // Generate MCP server
    const output = generateMcpServer({ description: DEMO_DESCRIPTION });

    // Create output directory
    const fullOutputDir = path.resolve(OUTPUT_DIR);
    
    // Safety check: do not overwrite existing directories (prevent data loss)
    if (fs.existsSync(fullOutputDir)) {
      console.error(`⚠️  Output directory exists: ${fullOutputDir}`);
      console.error('   Aborting to prevent data loss. Delete manually to regenerate.');
      process.exit(1);
    }

    fs.mkdirSync(fullOutputDir, { recursive: true });
    fs.mkdirSync(path.join(fullOutputDir, 'src'), { recursive: true });

    // Write files
    for (const file of output.files) {
      const filePath = path.join(fullOutputDir, file.path);
      const dir = path.dirname(filePath);
      
      // Ensure directory exists (handles nested paths like src/server.ts)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, file.content);
      console.error(`   ✓ Created: ${file.path}`);
    }

    console.error('\n✅ Demo generated successfully!');
    console.error(`   Location: ${fullOutputDir}`);
    console.error(`   Files: ${output.files.length}`);
    console.error(`   Complexity: ${output.metadata.estimatedComplexity}`);
    console.error(`   Tool: ${output.metadata.toolName}`);
    console.error(`   Project: ${output.metadata.projectName}`);
    
    if (output.metadata.warnings.length > 0) {
      console.error('\n⚠️  Warnings:');
      for (const warning of output.metadata.warnings) {
        console.error(`   - ${warning}`);
      }
    }

    console.error('\n📋 Next steps:');
    console.error('   cd generated/customer-lookup-mcp');
    console.error('   npm install');
    console.error('   npm run dev  # for development');
    console.error('   npx @modelcontextprotocol/inspector  # for testing');
    
  } catch (error) {
    console.error('❌ Demo generation failed:');
    console.error(`   ${error instanceof Error ? error.message : 'unknown error'}`);
    process.exit(1);
  }
}

runDemo();