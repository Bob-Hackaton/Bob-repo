const express = require('express');
const router = express.Router();
const Job = require('../models/job');

/**
 * POST /api/v1/generate
 * Create a new MCP server generation job
 */
router.post('/', async (req, res) => {
  try {
    const { description, complianceProfile } = req.body;
    
    // Validate input
    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Description is required and must be a string',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (description.length > 1000) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Description must be less than 1000 characters',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Validate compliance profile
    const validProfiles = ['general', 'gdpr', 'soc2', 'hipaa'];
    const profile = complianceProfile || 'general';
    
    if (!validProfiles.includes(profile)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: `Invalid compliance profile. Must be one of: ${validProfiles.join(', ')}`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Create job
    const job = Job.create({
      description: description.trim(),
      complianceProfile: profile,
      userId: req.userId || null // Will be set when auth is implemented
    });
    
    // TODO: Start background processing
    // For Day 1, we just create the job and return
    // On Day 2, we'll trigger the actual pipeline
    
    res.status(201).json({
      jobId: job.jobId,
      status: job.status,
      message: 'MCP server generation started'
    });
    
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create generation job',
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;

// Made with Bob
