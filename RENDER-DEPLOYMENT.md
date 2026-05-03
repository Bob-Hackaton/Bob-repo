# Deploy Bob MCP Forge Backend to Render

## Quick Deploy (5 minutes)

### Step 1: Sign up for Render
1. Go to https://render.com
2. Sign up with your GitHub account (free, no credit card needed)

### Step 2: Deploy from GitHub
1. Click "New +" → "Web Service"
2. Connect your GitHub account
3. Select the `Bob-Hackaton/Bob-repo` repository
4. Render will auto-detect the `render.yaml` configuration

### Step 3: Configure Environment Variables
In the Render dashboard, add these environment variables:

**Required:**
- `MONGODB_URI`: Your MongoDB Atlas connection string
  - Get from: https://cloud.mongodb.com
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/bob-mcp-forge`

**Optional (for full functionality):**
- `BOB_API_KEY`: IBM Bob API key (when available)
- `IBM_CLOUD_API_KEY`: For deployment features

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. Your API will be live at: `https://bob-mcp-forge-api.onrender.com`

### Step 5: Update Frontend
Update the API endpoint in your frontend:

File: `frontend/screens/landing.html`
```javascript
const API_BASE = 'https://bob-mcp-forge-api.onrender.com/api/v1';
```

Push the change to GitHub - your frontend will auto-update on GitHub Pages!

## Testing Your Deployment

```bash
# Health check
curl https://bob-mcp-forge-api.onrender.com/health

# Test generation
curl -X POST https://bob-mcp-forge-api.onrender.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"Create a weather API tool","complianceProfile":"general"}'
```

## Troubleshooting

### Service won't start
- Check logs in Render dashboard
- Verify `MONGODB_URI` is set correctly
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Frontend can't connect
- Check CORS settings in backend
- Verify API URL in frontend is correct
- Check browser console for errors

## Free Tier Limits
- 750 hours/month (enough for 24/7)
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds

## Alternative: Railway

If you prefer Railway:
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select `Bob-Hackaton/Bob-repo`
4. Set root directory to `backend/api`
5. Add environment variables
6. Deploy!

Your API will be at: `https://your-app.up.railway.app`