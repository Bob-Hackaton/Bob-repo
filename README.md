# 🛠️ Bob MCP Forge

> **Describe a tool in plain English. Get a secure, compliance-checked, production-ready MCP server in seconds.**

**IBM Dev Day: Bob Edition Hackathon — May 1-3, 2026**

---

## 🎯 The Problem

Two things are blocking enterprise AI adoption right now:

1. **MCP is the future, but it's developer-only.** Model Context Protocol is the hottest standard in agentic AI, but writing an MCP server requires deep technical knowledge. Non-engineers, PMs, and citizen developers are locked out.
2. **Enterprises don't trust AI-generated code.** GDPR, SOC2, HIPAA — every line of AI-generated code is a potential compliance landmine. Companies are afraid of data leaks, banned libraries, and insecure patterns.

## 💡 Our Solution

**Bob MCP Forge** is a web app that:
1. Takes a plain-English description of a tool ("search my emails", "check IBM Cloud costs", "look up patient records")
2. Uses IBM Bob to generate a complete, production-ready MCP server
3. Runs the generated code through our **Sovereign Compliance Agent** — an MCP-powered policy engine that audits for security and regulatory standards
4. Returns a clean compliance report → user fixes flagged issues → one-click deploy to IBM Cloud

**The combo wins:** the *generator* gives us the wow factor, the *compliance layer* gives us the enterprise trust IBM cares about.

---

## 🏆 Why This Wins the Hackathon

Mapped to the **4 judging criteria** (5 points each, 20 total):

| Criteria | How We Win |
|----------|------------|
| **Completeness & Feasibility** | Clean architecture, scoped MVP, deployable demo on IBM Cloud Code Engine. Every piece is realistic in 3 days. |
| **Creativity & Innovation** | Nobody has made MCP accessible to non-engineers. Combining generation + real-time compliance auditing is genuinely novel. |
| **Design & Usability** | Plain-English input → visual report → one-click deploy. A PM could use it. |
| **Effectiveness & Efficiency** | Solves two huge enterprise pains at once: AI accessibility + AI trust. Directly aligned with IBM's Trust + Security + Enterprise AI pitch. |

**Bonus IBM alignment:**
- Heavy use of **MCP** (matches Don Bourne's talk on MCP + IBM Bob + Liberty)
- **IBM Cloud** deployment target
- **Bob** is the core generator engine — we're showing what Bob can really do

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                      │
│   Plain-English input  →  Compliance Report  →  Deploy UI   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js)                    │
│        Orchestrator: routes requests through pipeline       │
└──┬─────────────────┬──────────────────────────┬─────────────┘
   │                 │                          │
   ▼                 ▼                          ▼
┌────────────┐  ┌──────────────────┐  ┌────────────────────┐
│ MCP        │  │ Compliance Agent │  │ Deploy Service     │
│ Generator  │  │ (MCP Server)     │  │                    │
│            │  │                  │  │                    │
│ • Bob API  │  │ • GDPR rules     │  │ • IBM Cloud Code   │
│ • Templates│  │ • SOC2 rules     │  │   Engine           │
│ • Schema   │  │ • HIPAA rules    │  │ • Container build  │
│   gen      │  │ • Secret scanner │  │ • One-click URL    │
│            │  │ • Banned libs    │  │                    │
└────────────┘  └──────────────────┘  └────────────────────┘
```

### The Pipeline (User Journey)
1. **User input** → "I want a tool that searches my company's Slack messages"
2. **Generator** → Bob produces an MCP server: tool schema, handlers, auth, error handling
3. **Compliance scan** → Our MCP server checks the generated code against policy rules:
   - ✅ No hardcoded secrets
   - ✅ Approved libraries only
   - ⚠️ PII handling needs encryption (HIPAA flag)
   - ❌ Insecure direct API call (fix suggested)
4. **Report UI** → User sees pass/fail per rule, with auto-fix suggestions
5. **Deploy** → One click → containerized → live on IBM Cloud Code Engine

---

## 👥 Team & Roles

| Member | Role | Primary Responsibility |
|--------|------|------------------------|
| **Alejandro** | MCP / Agentic lead | MCP server generator, agentic flows (has built MCP servers before!) |
| **Dilshad** | Backend / DevOps | Backend API, database, IBM Cloud deployment pipeline |
| **Tien** | Frontend | React UI for input, report view, deploy flow |
| **Sadia** | Design / Docs / Pitch | UI/UX wireframes, documentation, final presentation deck |

**Philosophy:** Everyone gets exposure to every phase so we can all put this on our resumes.

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + Tailwind | Fast to ship, looks polished |
| Backend | Node.js + Express | MCP SDK is best-supported in TS/JS |
| MCP SDK | `@modelcontextprotocol/sdk` | Official |
| AI | IBM Bob | The whole point of the hackathon |
| Compliance Engine | Custom MCP server | Our differentiator |
| Database | MongoDB Atlas (or local SQLite for MVP) | Simple, free tier |
| Deployment | IBM Cloud Code Engine | Container-based, free tier |
| Repo | GitHub Org | TBD — invite emails coming |

## 🐳 Docker Quick Start

Run the full local stack with Docker Compose:

```bash
cp .env.example .env
docker compose up
```

- Frontend: http://localhost:8080
- API: http://localhost:3001
- Health check: http://localhost:3001/health

Test generation + compliance audit:

```bash
curl -X POST http://localhost:3001/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"Tool that stores api key","complianceProfile":"soc2"}'
```

See [DOCKER.md](./DOCKER.md) for service details, environment variables, deployment checklist, and troubleshooting.

---

## 📅 3-Day Plan (May 1-3)

### **Day 1 — Friday May 1: Foundations**
- ☐ Kickoff call (10am ET)
- ☐ Repo structure finalized, everyone has push access
- ☐ Alejandro: scaffold MCP generator with hardcoded template (no Bob yet)
- ☐ Anthony: scaffold compliance engine MCP server with 3-5 sample rules
- ☐ Dilshad: backend API skeleton + deploy pipeline POC
- ☐ Tien: input form + basic report layout
- ☐ Sadia: wireframes for full flow + start pitch deck outline
- ☐ **End of day:** all components running locally, even if disconnected

### **Day 2 — Saturday May 2: Integration**
- ☐ Wire generator → compliance engine → frontend
- ☐ Replace hardcoded generator output with real Bob calls
- ☐ Add 10+ compliance rules covering GDPR, SOC2, HIPAA
- ☐ End-to-end demo working on localhost
- ☐ Sadia: pitch deck v1 done
- ☐ **End of day:** "ugly but working" full pipeline

### **Day 3 — Sunday May 3: Polish & Submit**
- ☐ Deploy to IBM Cloud (live URL!)
- ☐ Frontend polish (animations, error states, empty states)
- ☐ Record demo video (60-90 seconds)
- ☐ Final pitch deck
- ☐ Submit before deadline

---

## 🎬 Demo Script (60-second pitch)

> **[0:00]** "Enterprises want to use AI, but they're stuck. MCP is the standard for agentic AI tools — but it's developer-only. And nobody trusts AI-generated code in regulated industries."
>
> **[0:15]** "Meet Bob MCP Forge. I'll type what I want." *(types: "Tool that looks up customer records by email")*
>
> **[0:25]** "Bob generates the MCP server." *(code appears)*
>
> **[0:35]** "Our compliance agent scans it against GDPR, SOC2, HIPAA." *(report shows 1 warning, auto-fix offered)*
>
> **[0:45]** "I click fix. I click deploy." *(spinner → URL)*
>
> **[0:55]** "Live on IBM Cloud. Production-ready. Compliant. Built by anyone."

---

## 📂 Repo Structure

```
bob-mcp-forge/
├── README.md                # This file
├── docs/                    # Architecture, demo script, pitch deck
├── frontend/                # React app (Tien)
├── backend/
│   ├── generator/           # MCP server generator (Alejandro)
│   ├── policy-engine/       # Compliance MCP server
│   └── api/                 # Orchestrator API (Dilshad)
└── .github/                 # CI, issue templates
```

---

## 📚 Research Resources (homework for tonight)

- **MCP spec:** https://modelcontextprotocol.io
- **MCP SDK examples:** https://github.com/modelcontextprotocol/servers
- **IBM Bob docs:** https://bob.ibm.com
- **IBM Cloud Code Engine:** https://www.ibm.com/cloud/code-engine
- **Compliance basics:**
  - GDPR cheat sheet: https://gdpr.eu/checklist/
  - SOC2 overview: https://www.aicpa.org/soc4so
  - HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/

---

## 💬 Communication

- **GitHub:** primary code collaboration
- **LinkedIn group chat:** quick async messages
- **Discord (TBD):** dedicated channels per workstream — **#general, #frontend, #backend, #mcp, #demo**
- **Google Meet:** sync calls when needed

---

## 🚦 Status

**Current status:** Planning phase. Project locked in. Repo being set up. Roles assigned. Day 1 kickoff Friday May 1.

**Next checkpoint:** Tonight (April 30) — everyone reviews this doc, drops feedback, and starts homework.

---

*Built with ☕ and IBM Bob for the IBM Dev Day Hackathon 2026.*
