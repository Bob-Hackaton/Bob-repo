# Navigation Guide - Bob MCP Forge

## File Structure
```
frontend/
├── index.html              # Homepage (marketing page)
└── screens/
    ├── landing.html        # Step 1: Input prompt
    ├── progress.html       # Step 2: Generation progress
    ├── code-preview.html   # Step 3: View generated code
    ├── compliance.html     # Step 4: Compliance dashboard
    └── deployment.html     # Step 5: Deploy to cloud
```

## Navigation Flow

### Primary Flow (User Journey)
```
index.html → landing.html → progress.html → code-preview.html → compliance.html → deployment.html
```

### Navigation Links

#### From Homepage (index.html)
- **Logo "Bob MCP Forge"** → index.html (stays on homepage)
- **Home link** → index.html (stays on homepage)
- **Get Started button** → screens/landing.html
- **Start Building button** → screens/landing.html
- **View Demo button** → screens/landing.html

#### From Landing Page (screens/landing.html)
- **Logo "Bob MCP Forge"** → ../index.html (back to homepage)
- **Home link** → ../index.html (back to homepage)
- **Generate MCP Server button** → progress.html (auto-navigates after validation)

#### From Progress Page (screens/progress.html)
- **Logo "Bob MCP Forge"** → ../index.html (back to homepage)
- **Home link** → ../index.html (back to homepage)
- **Auto-navigation** → code-preview.html (after generation completes)

#### From Code Preview (screens/code-preview.html)
- **Logo "Bob MCP Forge"** → ../index.html (back to homepage)
- **Home link** → ../index.html (back to homepage)
- **New Project button** → landing.html (start over)
- **View Compliance Report button** → compliance.html (next step)

#### From Compliance Dashboard (screens/compliance.html)
- **Logo "Bob MCP Forge"** → ../index.html (back to homepage)
- **Home link** → ../index.html (back to homepage)
- **Back to Code button** → code-preview.html (previous step)
- **Deploy to Cloud button** → deployment.html (next step)
- **Continue to Deployment button** → deployment.html (next step)

#### From Deployment Page (screens/deployment.html)
- **Logo "Bob MCP Forge"** → ../index.html (back to homepage)
- **Home link** → ../index.html (back to homepage)
- **Back to Compliance button** → compliance.html (previous step)
- **Back to Home button** → ../index.html (after successful deployment)
- **Create New Server button** → landing.html (start new project)

## Path Resolution

### From index.html (root level)
- To screens: `screens/landing.html`
- To self: `index.html`

### From screens/*.html (inside screens folder)
- To homepage: `../index.html`
- To other screens: `landing.html`, `progress.html`, etc. (same folder)
- To styles: `../styles/global.css`

## Testing Navigation Locally

1. Open `index.html` in a browser
2. Click "Get Started" → should go to `screens/landing.html`
3. From landing, click logo → should return to `index.html`
4. From landing, click "Generate MCP Server" → should go to `progress.html`
5. Progress auto-advances → should go to `code-preview.html`
6. From code preview, click "View Compliance Report" → should go to `compliance.html`
7. From compliance, click "Deploy to Cloud" → should go to `deployment.html`
8. From deployment, click logo → should return to `index.html`

## Key Features

✅ **Consistent Logo Navigation**: Clicking "Bob MCP Forge" logo always returns to homepage
✅ **Home Link**: Every page has a "Home" link in the navigation
✅ **Back Buttons**: Each step has a "Back" or "Previous" button where appropriate
✅ **Forward Flow**: Primary action buttons move to the next logical step
✅ **New Project**: "New Project" or "Create New Server" buttons return to landing page
✅ **Relative Paths**: All paths work correctly when opened locally (file://)

## Common Issues & Solutions

### Issue: Links don't work when opening files directly
**Solution**: All paths are relative and should work with `file://` protocol

### Issue: Can't return to homepage from screens
**Solution**: Click the logo or "Home" link in the header

### Issue: Lost in the flow
**Solution**: Use the logo to return to homepage, or use back buttons to go to previous step

## Auto-Navigation

The following pages have automatic navigation after completion:
- **progress.html**: Auto-advances to code-preview.html after ~10 seconds
- **deployment.html**: Shows success state after deployment completes (no auto-navigation)