import { describe, it, expect } from 'vitest';
import JobModel from './job.js';

describe('JobModel.create', () => {
  it('returns a job with jobId when mock mode is active', async () => {
    const job = await JobModel.create({
      description: 'Test MCP server',
      complianceProfile: 'general',
      userId: 'test-user-1',
    });
    expect(job).toBeDefined();
    expect(job.jobId).toBeDefined();
    expect(typeof job.jobId).toBe('string');
    expect(job.jobId.length).toBeGreaterThan(0);
    expect(job.description).toBe('Test MCP server');
    expect(job.complianceProfile).toBe('general');
    expect(job.status).toBe('queued');
  });

  it('returns job with default complianceProfile when not provided', async () => {
    const job = await JobModel.create({
      description: 'Another tool',
    });
    expect(job.complianceProfile).toBe('general');
  });

  it('returns job with null userId when not provided', async () => {
    const job = await JobModel.create({
      description: 'Tool without user',
    });
    expect(job.userId).toBeNull();
  });
});