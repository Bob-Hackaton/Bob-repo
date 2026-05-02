const express = require('express');
const router = express.Router();
const Job = require('../models/job');

/**
 * GET /api/v1/jobs/:jobId
 * Get job status and details
 */
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        error: {
          code: 'JOB_NOT_FOUND',
          message: `Job with ID ${jobId} not found`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.json(job);
    
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch job details',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/v1/jobs
 * List all jobs (with optional filters)
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    const jobs = Job.list({
      status,
      userId: req.userId || null,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      jobs,
      total: jobs.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to list jobs',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * DELETE /api/v1/jobs/:jobId
 * Delete a job
 */
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const deleted = Job.delete(jobId);
    
    if (!deleted) {
      return res.status(404).json({
        error: {
          code: 'JOB_NOT_FOUND',
          message: `Job with ID ${jobId} not found`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.json({
      jobId,
      message: 'Job deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete job',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * POST /api/v1/jobs/:jobId/fix
 * Apply compliance fixes
 */
router.post('/:jobId/fix', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { fixIds } = req.body;
    
    const job = Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        error: {
          code: 'JOB_NOT_FOUND',
          message: `Job with ID ${jobId} not found`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (!Array.isArray(fixIds) || fixIds.length === 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'fixIds must be a non-empty array',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // TODO: Implement fix application logic on Day 2
    // For now, just return a stub response
    
    res.json({
      jobId,
      status: 'applying_fixes',
      appliedCount: fixIds.length,
      message: 'Auto-fixes being applied'
    });
    
  } catch (error) {
    console.error('Error applying fixes:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to apply fixes',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * POST /api/v1/jobs/:jobId/deploy
 * Deploy MCP server to IBM Cloud
 */
router.post('/:jobId/deploy', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { region = 'us-south', instanceSize = 'small' } = req.body;
    
    const job = Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        error: {
          code: 'JOB_NOT_FOUND',
          message: `Job with ID ${jobId} not found`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // TODO: Implement deployment logic on Day 2/3
    // For now, just return a stub response
    
    res.json({
      jobId,
      status: 'deploying',
      message: 'Deployment initiated'
    });
    
  } catch (error) {
    console.error('Error deploying job:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to deploy job',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/v1/jobs/:jobId/deployment
 * Get deployment information
 */
router.get('/:jobId/deployment', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        error: {
          code: 'JOB_NOT_FOUND',
          message: `Job with ID ${jobId} not found`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (!job.data.deployment) {
      return res.status(404).json({
        error: {
          code: 'DEPLOYMENT_NOT_FOUND',
          message: 'Job has not been deployed yet',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.json(job.data.deployment);
    
  } catch (error) {
    console.error('Error fetching deployment:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch deployment information',
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;

// Made with Bob
