const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database
require('./db/database');

// Import routes
const generateRoute = require('./routes/generate');
const jobsRoute = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'bob-mcp-forge-api',
    version: '1.0.0'
  });
});

// API routes
app.post('/api/v1/generate', generateRoute);
app.use('/api/v1/jobs', jobsRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString()
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Bob MCP Forge API Server');
  console.log('================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   POST   http://localhost:${PORT}/api/v1/generate`);
  console.log(`   GET    http://localhost:${PORT}/api/v1/jobs/:jobId`);
  console.log(`   GET    http://localhost:${PORT}/api/v1/jobs`);
  console.log(`   DELETE http://localhost:${PORT}/api/v1/jobs/:jobId`);
  console.log(`   POST   http://localhost:${PORT}/api/v1/jobs/:jobId/fix`);
  console.log(`   POST   http://localhost:${PORT}/api/v1/jobs/:jobId/deploy`);
  console.log(`   GET    http://localhost:${PORT}/api/v1/jobs/:jobId/deployment`);
  console.log('');
  console.log('🎯 Day 1 MVP Ready! Press Ctrl+C to stop.');
  console.log('================================');
  console.log('');
});

module.exports = app;

// Made with Bob
