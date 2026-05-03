# Bob MCP Forge - Backend API

**Owner:** Dilshad  
**Role:** Backend Orchestrator  
**Hackathon:** IBM Dev Day 2026

---

## Overview

The Backend API is the central orchestrator for the Bob MCP Forge pipeline. It coordinates requests between the frontend, MCP Generator, Compliance Agent, and Deploy Service.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

---

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and version.

### Generate MCP Server
```
POST /api/v1/generate
Content-Type: application/json

{
  "description": "Create a GitHub issue tracker with webhook support",
  "complianceProfile": "general"
}
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "message": "MCP server generation started"
}
```

### Get Job Status
```
GET /api/v1/jobs/:jobId
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "progress": 0,
  "description": "Create a GitHub issue tracker...",
  "complianceProfile": "general",
  "stages": {
    "generation": { "status": null },
    "compliance": { "status": null },
    "deployment": { "status": null }
  },
  "data": {
    "generatedCode": null,
    "complianceReport": null,
    "deployment": null
  },
  "createdAt": "2026-05-01T18:00:00Z",
  "updatedAt": "2026-05-01T18:00:00Z"
}
```

### List All Jobs
```
GET /api/v1/jobs?status=queued&limit=20&offset=0
```

### Apply Compliance Fixes
```
POST /api/v1/jobs/:jobId/fix
Content-Type: application/json

{
  "fixIds": ["fix-001", "fix-003"]
}
```

### Deploy to IBM Cloud
```
POST /api/v1/jobs/:jobId/deploy
Content-Type: application/json

{
  "region": "us-south",
  "instanceSize": "small"
}
```

### Get Deployment Info
```
GET /api/v1/jobs/:jobId/deployment
```

### Delete Job
```
DELETE /api/v1/jobs/:jobId
```

---

## Testing with cURL

### Create a job
```bash
curl -X POST http://localhost:3000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a weather API that caches results",
    "complianceProfile": "general"
  }'
```

### Get job status
```bash
curl http://localhost:3000/api/v1/jobs/YOUR_JOB_ID
```

### List all jobs
```bash
curl http://localhost:3000/api/v1/jobs
```

---

## Testing with PowerShell

### Create a job
```powershell
$body = @{
    description = "Create a weather API that caches results"
    complianceProfile = "general"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/generate" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Get job status
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/jobs/YOUR_JOB_ID"
```

---

## Project Structure

```
backend/api/
├── src/
│   ├── server.js           # Main Express server
│   ├── routes/
│   │   ├── generate.js     # POST /api/v1/generate
│   │   └── jobs.js         # Job management endpoints
│   ├── models/
│   │   └── job.js          # Job model with CRUD operations
│   ├── services/           # (Day 2) Integration services
│   │   ├── generator.js    # Calls Alejandro's generator
│   │   ├── compliance.js   # Calls Anthony's policy engine
│   │   └── deploy.js       # IBM Cloud deployment
│   └── db/
│       └── database.js     # MongoDB connection
├── package.json
├── .env                    # Environment variables
└── README.md
```

---

## Environment Variables

See `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Service URLs (update when services are ready)
GENERATOR_SERVICE_URL=http://localhost:3001
POLICY_ENGINE_MCP_URL=http://localhost:3002
DEPLOY_SERVICE_URL=http://localhost:3003

# IBM Cloud
IBM_CLOUD_API_KEY=your-api-key-here
IBM_CLOUD_REGION=us-south
```

---

## Database Schema

The API uses **MongoDB Atlas** with Mongoose. The Job schema:

```javascript
{
  jobId: String (unique, indexed),
  userId: String (indexed),
  description: String (required),
  complianceProfile: String (enum: general, gdpr, soc2, hipaa),
  status: String (indexed, enum: queued, generating, etc.),
  progress: Number (0-100),
  
  // Stage tracking
  stages: {
    generation: {
      status: String,
      startedAt: Date,
      completedAt: Date
    },
    compliance: { ... },
    deployment: { ... }
  },
  
  -- Data (stored as JSON)
  generated_code TEXT,
  // Data (stored as nested objects)
  data: {
    generatedCode: { files: [...], schema: {...}, metadata: {...} },
    complianceReport: { overallStatus, rules: [...] },
    deployment: { url, region, status, deployedAt, health }
  },
  
  // Error tracking
  error: {
    message: String,
    code: String,
    stage: String
  },
  
  // Timestamps (auto-managed by Mongoose)
  createdAt: Date,
  updatedAt: Date
}
```

---

## Day 1 Status ✅

**Completed:**
- [x] Express server setup
- [x] MongoDB Atlas connection with Mongoose
- [x] Job model with CRUD operations
- [x] POST /api/v1/generate endpoint
- [x] GET /api/v1/jobs/:jobId endpoint
- [x] GET /api/v1/jobs (list) endpoint
- [x] DELETE /api/v1/jobs/:jobId endpoint
- [x] POST /api/v1/jobs/:jobId/fix endpoint (stub)
- [x] POST /api/v1/jobs/:jobId/deploy endpoint (stub)
- [x] GET /api/v1/jobs/:jobId/deployment endpoint
- [x] Error handling
- [x] Input validation
- [x] CORS configuration

**Ready for Day 2:**
- [ ] Connect to Generator service (Alejandro)
- [ ] Connect to Policy Engine MCP (Anthony)
- [ ] Implement pipeline orchestration
- [ ] Add real-time updates (SSE)
- [ ] Implement auto-fix logic
- [ ] Implement deployment service

---

## Integration Points (Day 2)

### Generator Service (Alejandro)
```javascript
// src/services/generator.js
const axios = require('axios');

async function generateMCPServer(description, context) {
  const response = await axios.post(
    process.env.GENERATOR_SERVICE_URL + '/generate',
    { description, context }
  );
  return response.data;
}
```

### Policy Engine MCP (Anthony)
```javascript
// src/services/compliance.js
const { MCPClient } = require('@modelcontextprotocol/sdk');

async function checkCompliance(code, policies) {
  const client = new MCPClient();
  await client.connect(process.env.POLICY_ENGINE_MCP_URL);
  
  const result = await client.callTool('audit_code', {
    code,
    policies
  });
  
  return result;
}
```

---

## Error Codes

- `INVALID_REQUEST` - Malformed request
- `JOB_NOT_FOUND` - Invalid jobId
- `GENERATION_FAILED` - Generator error
- `COMPLIANCE_FAILED` - Policy engine error
- `DEPLOYMENT_FAILED` - Deploy service error
- `INTERNAL_ERROR` - Unexpected server error

---

## Next Steps

1. **Test the API** - Use cURL or Postman to verify all endpoints work
2. **Coordinate with team:**
   - Alejandro: Confirm generator service URL and contract
   - Anthony: Confirm policy engine MCP connection details
   - Tien: Share API response format for frontend integration
3. **Day 2 tasks:**
   - Implement service integrations
   - Add pipeline orchestration logic
   - Implement real-time updates
4. **Day 3 tasks:**
   - Deploy to IBM Cloud Code Engine
   - Performance optimization
   - Final testing

---

## Troubleshooting

### MongoDB connection error
If you see "MongoDB connection error", check:
- Your MONGODB_URI in `.env` is correct
- MongoDB Atlas IP whitelist includes your IP (or 0.0.0.0/0 for testing)
- Username and password are correct

### Port already in use
Change the PORT in `.env` or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Module not found
Run `npm install` to ensure all dependencies are installed.

---

## Team Contact

- **Dilshad** (Backend/DevOps) - API orchestrator, deployment
- **Alejandro** (MCP/Agentic) - Generator service
- **Ale & Sadia** (Architecture) - Policy engine MCP
- **Tien** (Frontend) - React UI
- **Sadia** (Design/Docs) - UI/UX, documentation

---

**Status:** Day 1 MVP Complete ✅  
**Last Updated:** May 1, 2026
