const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const { runComplianceAudit } = require('../services/complianceService');

/**
 * POST /api/v1/generate
 * Create a new MCP server generation job and run compliance audit
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
    
    // Create job first so polling can observe the completed state after audit
    const job = await Job.create({
      description: description.trim(),
      complianceProfile: profile,
      userId: req.userId || null,
    });

    await Job.updateStatus(job.jobId, 'generating', 10);

    // Run compliance audit (generate + audit)
    const auditResult = await runComplianceAudit({
      description: description.trim(),
      complianceProfile: profile,
      userId: req.userId || null,
    });

    await Job.updateGeneration(job.jobId, 'completed', { files: auditResult.generatedFiles });
    await Job.updateCompliance(job.jobId, 'completed', auditResult.auditResult);
    await Job.updateStatus(job.jobId, 'generated', 100);
    
    res.status(201).json({
      jobId: job.jobId,
      status: 'generated',
      message: 'MCP server generated and audited',
      complianceReport: auditResult.auditResult,
      generatedFiles: auditResult.generatedFiles,
      complianceProfile: auditResult.complianceProfile,
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
