const mongoose = require('mongoose');

// Define the Job schema
const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  complianceProfile: {
    type: String,
    default: 'general',
    enum: ['general', 'gdpr', 'soc2', 'hipaa']
  },
  status: {
    type: String,
    required: true,
    default: 'queued',
    index: true,
    enum: ['queued', 'generating', 'generated', 'compliance_check', 'compliant', 'non_compliant', 'deploying', 'deployed', 'completed', 'failed']
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Stage tracking
  stages: {
    generation: {
      status: String,
      startedAt: Date,
      completedAt: Date
    },
    compliance: {
      status: String,
      startedAt: Date,
      completedAt: Date
    },
    deployment: {
      status: String,
      startedAt: Date,
      completedAt: Date
    }
  },
  
  // Data storage
  data: {
    generatedCode: {
      files: [{
        path: String,
        content: String
      }],
      schema: mongoose.Schema.Types.Mixed,
      metadata: {
        estimatedComplexity: String,
        suggestedDeps: [String]
      }
    },
    complianceReport: {
      overallStatus: String,
      rules: [{
        id: String,
        name: String,
        category: String,
        severity: String,
        status: String,
        message: String,
        location: {
          file: String,
          line: Number
        },
        autoFixAvailable: Boolean,
        fixId: String,
        suggestedFix: String
      }],
      scannedAt: Date
    },
    deployment: {
      url: String,
      region: String,
      status: String,
      deployedAt: Date,
      health: String
    }
  },
  
  // Error tracking
  error: {
    message: String,
    code: String,
    stage: String
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Create the model
const Job = mongoose.model('Job', jobSchema);

// Static methods for CRUD operations
class JobModel {
  /**
   * Create a new job
   */
  static async create({ description, complianceProfile = 'general', userId = null }) {
    const { v4: uuidv4 } = require('uuid');
    const jobId = uuidv4();
    
    const job = new Job({
      jobId,
      userId,
      description,
      complianceProfile,
      status: 'queued',
      progress: 0,
      stages: {
        generation: {},
        compliance: {},
        deployment: {}
      },
      data: {}
    });
    
    await job.save();
    return this._formatJob(job);
  }

  /**
   * Find job by ID
   */
  static async findById(jobId) {
    const job = await Job.findOne({ jobId });
    if (!job) return null;
    return this._formatJob(job);
  }

  /**
   * Update job status and progress
   */
  static async updateStatus(jobId, status, progress = null) {
    const update = { status };
    if (progress !== null) {
      update.progress = progress;
    }
    
    const job = await Job.findOneAndUpdate(
      { jobId },
      update,
      { new: true }
    );
    
    return job ? this._formatJob(job) : null;
  }

  /**
   * Update generation stage
   */
  static async updateGeneration(jobId, status, data = null) {
    const update = {
      'stages.generation.status': status
    };
    
    if (status === 'in_progress') {
      update['stages.generation.startedAt'] = new Date();
    } else if (status === 'completed' && data) {
      update['stages.generation.completedAt'] = new Date();
      update['data.generatedCode'] = data;
    }
    
    const job = await Job.findOneAndUpdate(
      { jobId },
      update,
      { new: true }
    );
    
    return job ? this._formatJob(job) : null;
  }

  /**
   * Update compliance stage
   */
  static async updateCompliance(jobId, status, report = null) {
    const update = {
      'stages.compliance.status': status
    };
    
    if (status === 'in_progress') {
      update['stages.compliance.startedAt'] = new Date();
    } else if (status === 'completed' && report) {
      update['stages.compliance.completedAt'] = new Date();
      update['data.complianceReport'] = report;
    }
    
    const job = await Job.findOneAndUpdate(
      { jobId },
      update,
      { new: true }
    );
    
    return job ? this._formatJob(job) : null;
  }

  /**
   * Update deployment stage
   */
  static async updateDeployment(jobId, status, info = null) {
    const update = {
      'stages.deployment.status': status
    };
    
    if (status === 'in_progress') {
      update['stages.deployment.startedAt'] = new Date();
    } else if (status === 'completed' && info) {
      update['stages.deployment.completedAt'] = new Date();
      update['data.deployment'] = info;
    }
    
    const job = await Job.findOneAndUpdate(
      { jobId },
      update,
      { new: true }
    );
    
    return job ? this._formatJob(job) : null;
  }

  /**
   * Set error on job
   */
  static async setError(jobId, errorMessage, errorCode, errorStage) {
    const job = await Job.findOneAndUpdate(
      { jobId },
      {
        status: 'failed',
        error: {
          message: errorMessage,
          code: errorCode,
          stage: errorStage
        }
      },
      { new: true }
    );
    
    return job ? this._formatJob(job) : null;
  }

  /**
   * List all jobs (with pagination)
   */
  static async list({ status = null, userId = null, limit = 20, offset = 0 }) {
    const query = {};
    
    if (status) query.status = status;
    if (userId) query.userId = userId;
    
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    
    return jobs.map(job => this._formatJob(job));
  }

  /**
   * Delete job
   */
  static async delete(jobId) {
    const result = await Job.deleteOne({ jobId });
    return result.deletedCount > 0;
  }

  /**
   * Format job for API response
   */
  static _formatJob(job) {
    return {
      jobId: job.jobId,
      userId: job.userId,
      description: job.description,
      complianceProfile: job.complianceProfile,
      status: job.status,
      progress: job.progress,
      
      stages: {
        generation: {
          status: job.stages?.generation?.status || null,
          startedAt: job.stages?.generation?.startedAt || null,
          completedAt: job.stages?.generation?.completedAt || null
        },
        compliance: {
          status: job.stages?.compliance?.status || null,
          startedAt: job.stages?.compliance?.startedAt || null,
          completedAt: job.stages?.compliance?.completedAt || null
        },
        deployment: {
          status: job.stages?.deployment?.status || null,
          startedAt: job.stages?.deployment?.startedAt || null,
          completedAt: job.stages?.deployment?.completedAt || null
        }
      },
      
      data: {
        generatedCode: job.data?.generatedCode || null,
        complianceReport: job.data?.complianceReport || null,
        deployment: job.data?.deployment || null
      },
      
      error: job.error || null,
      
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
  }
}

module.exports = JobModel;

// Made with Bob
