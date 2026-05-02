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
    const job = await Job.create({
      description: description.trim(),
      complianceProfile: profile,
      userId: req.userId || null
    });
    
    // Start background processing
    // We don't await this so we can return the response immediately
    processGeneration(job.jobId, description.trim()).catch(err => {
      console.error(`[Background] Error processing job ${job.jobId}:`, err);
    });
    
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

/**
 * Async processing of the generation job
 */
async function processGeneration(jobId, description) {
  try {
    // 1. Update status to generating
    await Job.updateStatus(jobId, 'generating', 10);
    await Job.updateGeneration(jobId, 'in_progress');

    // 2. Import generator dynamically (handled by tsx/node)
    // Using relative path to the generator's source to avoid build requirements
    const { generateMcpServer } = await import('../../../generator/src/index.ts');

    // 3. Trigger generation
    const output = await generateMcpServer({ 
      description,
      context: {
        timestamp: new Date().toISOString()
      }
    });

    // 4. Update job with results
    await Job.updateStatus(jobId, 'generated', 100);
    await Job.updateGeneration(jobId, 'completed', {
      files: output.files,
      schema: output.schema,
      metadata: {
        estimatedComplexity: output.metadata.estimatedComplexity,
        suggestedDeps: output.metadata.suggestedDeps,
        toolName: output.metadata.toolName,
        projectName: output.metadata.projectName,
        generationMode: output.metadata.generationMode
      }
    });

    console.log(`[Job ${jobId}] Generation complete! Mode: ${output.metadata.generationMode}`);

  } catch (error) {
    console.error(`[Job ${jobId}] Generation failed:`, error);
    await Job.setError(
      jobId, 
      error.message || 'Unknown generation error', 
      'GENERATION_FAILED', 
      'generation'
    );
  }
}

module.exports = router;

// Connected to Generator by Bob
