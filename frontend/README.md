# Bob MCP Forge - Frontend

A clean, professional SaaS web application UI for an AI developer tool that converts plain English prompts into MCP server code with compliance checks and cloud deployment.

## Design System

### Typography
- **Font Family**: Inter (sans-serif), JetBrains Mono (monospace)
- **Scale**: 12px to 40px with clear hierarchy
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Colors
- **Primary**: #0f62fe (IBM Blue)
- **Success**: #24a148 (Green)
- **Warning**: #f1c21b (Yellow)
- **Error**: #da1e28 (Red)
- **Neutrals**: White, grays from #f4f4f4 to #161616

### Spacing
- **8px Grid System**: All spacing uses multiples of 8px
- **Variables**: --space-1 (8px) through --space-12 (96px)

### Components
- **Buttons**: Primary, secondary with hover states
- **Cards**: Rounded corners (12-16px), subtle shadows
- **Badges**: Color-coded status indicators
- **Inputs**: Clean borders with focus states
- **Code Blocks**: Dark theme with syntax highlighting

## Screens

### 1. Landing Page (`landing.html`)
- **Purpose**: Prompt input and project configuration
- **Features**:
  - Large textarea for MCP tool description
  - Compliance profile dropdown (General, GDPR, SOC2, HIPAA)
  - Example prompts for quick start
  - Feature highlights grid
  - Primary CTA: "Generate MCP Server"

### 2. Progress Screen (`progress.html`)
- **Purpose**: Show generation progress with visual feedback
- **Features**:
  - 4-step progress indicator with animations
  - Animated code generation visual
  - Progress bar (0-100%)
  - Step-by-step status updates
  - Auto-advances to code preview when complete

### 3. Code Preview (`code-preview.html`)
- **Purpose**: Display generated code with file tree navigation
- **Features**:
  - Split layout: sidebar file tree + code viewer
  - Syntax-highlighted code display
  - File navigation (server.ts, schema.json, package.json, Dockerfile, README.md)
  - Copy code button
  - Download ZIP option
  - Navigate to compliance report

### 4. Compliance Dashboard (`compliance.html`)
- **Purpose**: Show security and policy compliance results
- **Features**:
  - Summary cards: Overall score, Passed, Warnings, Failed
  - Filterable issue list by severity and category
  - Detailed issue cards with:
    - Severity badge (critical, warning, info)
    - File location
    - Description and explanation
    - Suggested fix with code examples
    - "Apply Fix" button
  - Action bar for bulk fixes and deployment

### 5. Deployment Screen (`deployment.html`)
- **Purpose**: Deploy MCP server to IBM Cloud
- **Features**:
  - Pre-deployment checklist (all validated)
  - Configuration options (region, instance size, name)
  - Deployment progress with live logs
  - Success state with:
    - Live URL display
    - Copy URL button
    - Status indicators (running, region, instance)
    - Actions: Create new server, View dashboard

## File Structure

```
frontend/
├── index.html                 # Main entry point
├── styles/
│   ├── global.css            # Global styles and layout
│   └── design-system.css     # Design tokens and components
├── screens/
│   ├── landing.html          # Landing/input screen
│   ├── progress.html         # Generation progress
│   ├── code-preview.html     # Code viewer with file tree
│   ├── compliance.html       # Compliance dashboard
│   └── deployment.html       # Deployment interface
└── README.md                 # This file
```

## Usage

### Local Development

1. Open any screen directly in a browser:
   ```bash
   # Start with landing page
   open frontend/screens/landing.html
   ```

2. Navigate between screens using the UI buttons

### Screen Flow

```
Landing → Progress → Code Preview → Compliance → Deployment
   ↓                                      ↓            ↓
   └──────────────────────────────────────┴────────────┘
              (New Project button returns to Landing)
```

## Design Principles

1. **Minimal & Professional**: Clean IBM/GitHub-inspired aesthetic
2. **Developer-Focused**: Monospace fonts for code, clear technical information
3. **Consistent Spacing**: 8px grid system throughout
4. **Clear Hierarchy**: Large headings, medium labels, small metadata
5. **Scannable Layout**: Card-based design with clear sections
6. **Accessible**: High contrast, clear focus states, semantic HTML
7. **Responsive**: Mobile-friendly with breakpoints at 768px

## Interactive States

- **Loading**: Spinners and progress bars with animations
- **Hover**: Subtle background changes on interactive elements
- **Active**: Visual feedback on button clicks
- **Disabled**: Reduced opacity when actions are blocked
- **Success/Error**: Color-coded feedback for user actions

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox required
- CSS Custom Properties (variables) required

## Future Enhancements

- Add React/TypeScript implementation
- Connect to backend APIs
- Add real-time deployment logs via WebSocket
- Implement actual code syntax highlighting library
- Add dark mode toggle
- Add keyboard shortcuts
- Add accessibility improvements (ARIA labels, screen reader support)

## Credits

Design inspired by:
- IBM Carbon Design System
- GitHub UI
- Modern AI developer tools (Vercel, Railway, Render)
