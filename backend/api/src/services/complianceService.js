/**
 * Compliance Service - Wires generator output through policy-engine audit
 * 
 * Architecture: spawns complianceWrapper.ts via npx tsx with stdin/stdout JSON.
 * This avoids the build step (both generator and policy-engine have TS errors).
 * Generator is called with template fallback (no Bob API key), then all generated
 * files are audited through policy-engine's auditCode pure function.
 */
const { spawn } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const MAX_FILES = 10;
const MAX_FILE_SIZE = 512_000; // 512KB per file

// Derive repo root from __dirname: backend/api/src/services -> up 4 levels
// services/../ = src, ../../ = api, ../../../ = backend, ../../../../ = repo root
const REPO_ROOT = path.resolve(__dirname, '../../../../');
const COMPLIANCE_WRAPPER = path.join(REPO_ROOT, 'backend/generator/src/complianceWrapper.ts');

/**
 * Pure validation — returns error message string or null if valid.
 * Exported via __internals for unit testing only.
 */
function isValidInput({ description, files }) {
  if (!description || typeof description !== 'string') {
    return 'Description is required and must be a string';
  }
  if (files !== undefined && !Array.isArray(files)) {
    return 'files must be an array';
  }
  const fileArray = Array.isArray(files) ? files : [];
  if (fileArray.length > MAX_FILES) {
    return `Too many files: maximum ${MAX_FILES} allowed`;
  }
  for (const file of fileArray) {
    if (!file.path || !file.content) {
      return 'Each file must have path and content';
    }
    if (file.content.length > MAX_FILE_SIZE) {
      return `File ${file.path} exceeds maximum size of ${MAX_FILE_SIZE} bytes`;
    }
  }
  return null;
}

/**
 * Run compliance audit on generated MCP server output.
 * 
 * @param {object} input
 * @param {string} input.description - Tool description used to generate MCP server
 * @param {Array<{path: string, content: string}>} [input.files] - Pre-generated files to audit (optional, will generate if not provided)
 * @param {string} [input.complianceProfile='general'] - Compliance profile: general | gdpr | soc2 | hipaa
 * @param {string} [input.userId] - Optional user ID for job tracking
 * @returns {Promise<{jobId: string, status: string, auditResult: object, generatedFiles: Array, complianceProfile: string}>}
 */
async function runComplianceAudit({ description, files, complianceProfile = 'general', userId = null }) {
  const validationError = isValidInput({ description, files });
  if (validationError) {
    throw new Error(validationError);
  }

  const fileArray = Array.isArray(files) ? files : [];
  const jobId = uuidv4();

  const input = {
    description,
    files: fileArray.length > 0 ? fileArray : null,
    complianceProfile,
  };

  const result = await runWrapper(input);

  // Normalize wrapper output to { generatedFiles: File[], metadata: object }.
  // Handles new shape, legacy shapes (flat and nested), raw arrays, and fileArray fallback.
  let generatedFiles = Array.isArray(fileArray) ? fileArray : [];
  let metadata = {};

  if (Array.isArray(result)) {
    generatedFiles = result;
  } else if (result.generatedFiles) {
    if (Array.isArray(result.generatedFiles)) {
      generatedFiles = result.generatedFiles;
      metadata = result.metadata || {};
    } else if (typeof result.generatedFiles === 'object') {
      // nested { files, metadata } inside generatedFiles
      generatedFiles = Array.isArray(result.generatedFiles.files) ? result.generatedFiles.files : [];
      metadata = result.generatedFiles.metadata || result.metadata || {};
    }
  } else if (Array.isArray(result.files)) {
    generatedFiles = result.files;
    metadata = result.metadata || {};
  }

  return {
    jobId,
    status: 'audit_complete',
    auditResult: result.auditResult || {},
    generatedFiles,
    metadata,
    complianceProfile,
    userId,
    message: generatedFiles.length > 0 ? 'MCP server generated and audited successfully' : 'Compliance audit complete',
  };
}

/**
 * Spawn npx tsx on Windows
 * Windows: npx.cmd is a batch file; invoke via cmd /c to avoid shell:true
 * Other platforms: npx is a shell script, use spawn directly
 */
function spawnNpxTsx(args, options) {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    // npx.cmd lives in nodejs directory; invoke via cmd /c
    const npxPath = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npx.cmd');
    return spawn('cmd', ['/c', npxPath, ...args], { ...options, shell: false });
  }
  return spawn('npx', args, options);
}

/**
 * Run compliance wrapper via npx tsx with stdin/stdout JSON
 */
function runWrapper(input) {
  return new Promise((resolve, reject) => {
    console.log('🔧 Spawning generator with env:', {
      BOB_ENABLED: process.env.BOB_ENABLED,
      HAS_IBM_CLOUD_API_KEY: !!process.env.IBM_CLOUD_API_KEY,
      HAS_WATSONX_PROJECT_ID: !!process.env.WATSONX_PROJECT_ID,
    });
    
    const cmd = spawnNpxTsx(['tsx', COMPLIANCE_WRAPPER], {
      cwd: REPO_ROOT,
      env: { ...process.env }
    });

    let stdout = '', stderr = '';
    cmd.stdout.on('data', d => stdout += d);
    cmd.stderr.on('data', d => stderr += d);

    cmd.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Compliance wrapper failed with code ${code}: ${stderr}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error(`Failed to parse wrapper output: ${stdout.substring(0, 200)}`));
      }
    });

    cmd.on('error', e => {
      reject(new Error(`Failed to spawn compliance wrapper: ${e.message}`));
    });

    cmd.stdin.write(JSON.stringify(input));
    cmd.stdin.end();
  });
}

const __internals = {
  MAX_FILES,
  MAX_FILE_SIZE,
  REPO_ROOT,
  COMPLIANCE_WRAPPER,
  isValidInput,
  spawnNpxTsx,
};

module.exports = { runComplianceAudit, __internals };
