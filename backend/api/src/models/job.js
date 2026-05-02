const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define the Job schema
const jobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, index: true },
  description: { type: String, required: true },
  complianceProfile: { type: String, default: 'general', enum: ['general', 'gdpr', 'soc2', 'hipaa'] },
  status: { type: String, required: true, default: 'queued', index: true, enum: ['queued', 'generating', 'generated', 'compliance_check', 'compliant', 'non_compliant', 'deploying', 'deployed', 'completed', 'failed'] },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  stages: {
    generation: { status: String, startedAt: Date, completedAt: Date },
    compliance: { status: String, startedAt: Date, completedAt: Date },
    deployment: { status: String, startedAt: Date, completedAt: Date }
  },
  data: {
    generatedCode: {
      files: [{ path: String, content: String }],
      schema: mongoose.Schema.Types.Mixed,
      metadata: { estimatedComplexity: String, suggestedDeps: [String] }
    },
    complianceReport: {
      overallStatus: String,
      rules: [{
        id: String, name: String, category: String, severity: String, status: String,
        message: String, location: { file: String, line: Number },
        autoFixAvailable: Boolean, fixId: String, suggestedFix: String
      }],
      scannedAt: Date
    },
    deployment: { url: String, region: String, status: String, deployedAt: Date, health: String }
  },
  error: { message: String, code: String, stage: String }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

// In-memory mock store for dev without MongoDB
const mockStore = new Map();

function isMockMode() {
  try {
    const db = require('../db/database');
    return !db.isConnected();
  } catch {
    return true;
  }
}

// Mock implementations matching mongoose API signatures
const mockJobModel = {
  async create({ description, complianceProfile = 'general', userId = null }) {
    const jobId = uuidv4();
    const now = new Date();
    const job = {
      jobId, userId, description, complianceProfile,
      status: 'queued', progress: 0,
      stages: { generation: {}, compliance: {}, deployment: {} },
      data: {},
      createdAt: now, updatedAt: now
    };
    mockStore.set(jobId, job);
    return formatMockJob(job);
  },

  async findById(jobId) {
    const job = mockStore.get(jobId);
    return job ? formatMockJob(job) : null;
  },

  async updateStatus(jobId, status, progress = null) {
    const job = mockStore.get(jobId);
    if (!job) return null;
    job.status = status;
    if (progress !== null) job.progress = progress;
    job.updatedAt = new Date();
    return formatMockJob(job);
  },

  async updateGeneration(jobId, status, data = null) {
    const job = mockStore.get(jobId);
    if (!job) return null;
    job.stages = job.stages || {};
    job.stages.generation = job.stages.generation || {};
    job.stages.generation.status = status;
    if (status === 'in_progress') job.stages.generation.startedAt = new Date();
    else if (status === 'completed' && data) {
      job.stages.generation.completedAt = new Date();
      job.data = job.data || {};
      job.data.generatedCode = data;
    }
    job.updatedAt = new Date();
    return formatMockJob(job);
  },

  async updateCompliance(jobId, status, report = null) {
    const job = mockStore.get(jobId);
    if (!job) return null;
    job.stages = job.stages || {};
    job.stages.compliance = job.stages.compliance || {};
    job.stages.compliance.status = status;
    if (status === 'in_progress') job.stages.compliance.startedAt = new Date();
    else if (status === 'completed' && report) {
      job.stages.compliance.completedAt = new Date();
      job.data = job.data || {};
      job.data.complianceReport = report;
    }
    job.updatedAt = new Date();
    return formatMockJob(job);
  },

  async updateDeployment(jobId, status, info = null) {
    const job = mockStore.get(jobId);
    if (!job) return null;
    job.stages = job.stages || {};
    job.stages.deployment = job.stages.deployment || {};
    job.stages.deployment.status = status;
    if (status === 'in_progress') job.stages.deployment.startedAt = new Date();
    else if (status === 'completed' && info) {
      job.stages.deployment.completedAt = new Date();
      job.data = job.data || {};
      job.data.deployment = info;
    }
    job.updatedAt = new Date();
    return formatMockJob(job);
  },

  async setError(jobId, errorMessage, errorCode, errorStage) {
    const job = mockStore.get(jobId);
    if (!job) return null;
    job.status = 'failed';
    job.error = { message: errorMessage, code: errorCode, stage: errorStage };
    job.updatedAt = new Date();
    return formatMockJob(job);
  },

  async list({ status = null, userId = null, limit = 20, offset = 0 } = {}) {
    let jobs = Array.from(mockStore.values());
    if (status) jobs = jobs.filter(j => j.status === status);
    if (userId) jobs = jobs.filter(j => j.userId === userId);
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return jobs.slice(offset, offset + limit).map(formatMockJob);
  },

  async delete(jobId) {
    return mockStore.delete(jobId);
  }
};

function formatMockJob(job) {
  return {
    jobId: job.jobId, userId: job.userId, description: job.description,
    complianceProfile: job.complianceProfile, status: job.status, progress: job.progress,
    stages: {
      generation: { status: job.stages?.generation?.status || null, startedAt: job.stages?.generation?.startedAt || null, completedAt: job.stages?.generation?.completedAt || null },
      compliance: { status: job.stages?.compliance?.status || null, startedAt: job.stages?.compliance?.startedAt || null, completedAt: job.stages?.compliance?.completedAt || null },
      deployment: { status: job.stages?.deployment?.status || null, startedAt: job.stages?.deployment?.startedAt || null, completedAt: job.stages?.deployment?.completedAt || null }
    },
    data: { generatedCode: job.data?.generatedCode || null, complianceReport: job.data?.complianceReport || null, deployment: job.data?.deployment || null },
    error: job.error || null,
    createdAt: job.createdAt, updatedAt: job.updatedAt
  };
}

// Static methods - delegate to mock or real model based on connection state
class JobModel {
  static async create({ description, complianceProfile = 'general', userId = null }) {
    if (isMockMode()) return mockJobModel.create(...arguments);
    const jobId = uuidv4();
    const job = new Job({ jobId, description, complianceProfile, userId });
    await job.save();
    return JobModel._formatJob(job);
  }

  static async findById(...args) {
    if (isMockMode()) return mockJobModel.findById(...args);
    const job = await Job.findOne({ jobId: args[0] });
    return job ? JobModel._formatJob(job) : null;
  }

  static async updateStatus(...args) {
    if (isMockMode()) return mockJobModel.updateStatus(...args);
    const [jobId, status, progress] = args;
    const job = await Job.findOneAndUpdate({ jobId }, { status, ...(progress !== null && { progress }) }, { new: true });
    return job ? JobModel._formatJob(job) : null;
  }

  static async updateGeneration(...args) {
    if (isMockMode()) return mockJobModel.updateGeneration(...args);
    const [jobId, status, data] = args;
    const update = { 'stages.generation.status': status };
    if (status === 'in_progress') update['stages.generation.startedAt'] = new Date();
    else if (status === 'completed' && data) { update['stages.generation.completedAt'] = new Date(); update['data.generatedCode'] = data; }
    const job = await Job.findOneAndUpdate({ jobId }, update, { new: true });
    return job ? JobModel._formatJob(job) : null;
  }

  static async updateCompliance(...args) {
    if (isMockMode()) return mockJobModel.updateCompliance(...args);
    const [jobId, status, report] = args;
    const update = { 'stages.compliance.status': status };
    if (status === 'in_progress') update['stages.compliance.startedAt'] = new Date();
    else if (status === 'completed' && report) { update['stages.compliance.completedAt'] = new Date(); update['data.complianceReport'] = report; }
    const job = await Job.findOneAndUpdate({ jobId }, update, { new: true });
    return job ? JobModel._formatJob(job) : null;
  }

  static async updateDeployment(...args) {
    if (isMockMode()) return mockJobModel.updateDeployment(...args);
    const [jobId, status, info] = args;
    const update = { 'stages.deployment.status': status };
    if (status === 'in_progress') update['stages.deployment.startedAt'] = new Date();
    else if (status === 'completed' && info) { update['stages.deployment.completedAt'] = new Date(); update['data.deployment'] = info; }
    const job = await Job.findOneAndUpdate({ jobId }, update, { new: true });
    return job ? JobModel._formatJob(job) : null;
  }

  static async setError(...args) {
    if (isMockMode()) return mockJobModel.setError(...args);
    const [jobId, errorMessage, errorCode, errorStage] = args;
    const job = await Job.findOneAndUpdate({ jobId }, { status: 'failed', error: { message: errorMessage, code: errorCode, stage: errorStage } }, { new: true });
    return job ? JobModel._formatJob(job) : null;
  }

  static async list(...args) {
    if (isMockMode()) return mockJobModel.list(...args);
    const [{ status, userId, limit, offset }] = args;
    const query = {}; if (status) query.status = status; if (userId) query.userId = userId;
    const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(limit).skip(offset);
    return jobs.map(JobModel._formatJob);
  }

  static async delete(...args) {
    if (isMockMode()) return mockJobModel.delete(...args);
    const result = await Job.deleteOne({ jobId: args[0] });
    return result.deletedCount > 0;
  }

  static _formatJob(job) {
    return {
      jobId: job.jobId, userId: job.userId, description: job.description, complianceProfile: job.complianceProfile, status: job.status, progress: job.progress,
      stages: {
        generation: { status: job.stages?.generation?.status || null, startedAt: job.stages?.generation?.startedAt || null, completedAt: job.stages?.generation?.completedAt || null },
        compliance: { status: job.stages?.compliance?.status || null, startedAt: job.stages?.compliance?.startedAt || null, completedAt: job.stages?.compliance?.completedAt || null },
        deployment: { status: job.stages?.deployment?.status || null, startedAt: job.stages?.deployment?.startedAt || null, completedAt: job.stages?.deployment?.completedAt || null }
      },
      data: { generatedCode: job.data?.generatedCode || null, complianceReport: job.data?.complianceReport || null, deployment: job.data?.deployment || null },
      error: job.error || null, createdAt: job.createdAt, updatedAt: job.updatedAt
    };
  }
}

module.exports = JobModel;

// Made with Bob
