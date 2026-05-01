/**
 * Package.json template for generated MCP server
 */
import type { TemplateContext } from '../types.js';

export function generatePackageJson(ctx: TemplateContext): string {
  const deps = ['@modelcontextprotocol/sdk', 'zod', 'tsx'];
  
  if (ctx.complexity === 'high') {
    deps.push('express', 'helmet', 'cors', 'express-rate-limit');
  } else if (ctx.complexity === 'medium') {
    deps.push('axios');
  }

  return JSON.stringify({
    name: ctx.projectName,
    version: '1.0.0',
    description: ctx.description,
    type: 'module',
    main: './dist/server.js',
    scripts: {
      build: 'tsc',
      start: 'node dist/server.js',
      dev: 'tsx src/server.ts',
      test: 'vitest run',
      typecheck: 'tsc --noEmit'
    },
    dependencies: Object.fromEntries(
      deps.map(dep => {
        const version = dep === '@modelcontextprotocol/sdk' ? '^1.0.0' 
          : dep === 'zod' ? '^3.23.8'
          : dep === 'express' ? '^4.21.0'
          : dep === 'helmet' ? '^8.0.0'
          : dep === 'cors' ? '^2.8.5'
          : dep === 'express-rate-limit' ? '^7.4.0'
          : dep === 'axios' ? '^1.7.0'
          : dep === 'tsx' ? '^4.19.0'
          : '^1.0.0';
        return [dep, version];
      })
    ),
    devDependencies: {
      typescript: '^5.6.0',
      '@types/node': '^22.0.0',
      vitest: '^2.0.0'
    },
    engines: {
      node: '>=20.0.0'
    }
  }, null, 2);
}