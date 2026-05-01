/**
 * Naming helpers for MCP server generator
 * Ensures consistent naming conventions across generated projects.
 */

/**
 * Convert a description to a kebab-case project name.
 * Removes special characters, replaces spaces with hyphens.
 */
export function toProjectName(description: string): string {
  if (!description || typeof description !== 'string') {
    return 'unnamed-project';
  }
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) || 'unnamed-project';
}

/**
 * Convert a description to a snake_case tool name.
 */
export function toToolName(description: string): string {
  if (!description || typeof description !== 'string') {
    return 'unnamed_tool';
  }
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 40) || 'unnamed_tool';
}

/**
 * Convert a description to a PascalCase server name.
 */
export function toServerName(description: string): string {
  if (!description || typeof description !== 'string') {
    return 'UnnamedServer';
  }
  return description
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .substring(0, 50) || 'UnnamedServer';
}

/**
 * Validate project name has no spaces and is kebab-case.
 */
export function isValidProjectName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length >= 3 && name.length <= 50;
}

/**
 * Validate tool name is snake_case.
 */
export function isValidToolName(name: string): boolean {
  return /^[a-z][a-z0-9_]*[a-z0-9]$/.test(name) && name.length >= 2 && name.length <= 40;
}