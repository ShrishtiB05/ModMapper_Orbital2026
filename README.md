# ModMapper_Orbital2026

# ModMapper

A collaborative timetable planner for NUS students. Search modules, build conflict-free schedules through a constraint solver, and sync plans with friends in real time.

**Live:** [modmapper.vercel.app](https://modmapper.vercel.app/login)

---

## Features

- Module search powered by the NUSMods API
- Constraint-based timetable generation that avoids clashes automatically
- Real-time collaboration — plan with friends simultaneously
- AI-powered module recommendations via Claude
- Interactive timetable visualisation built with D3.js

---

## Tech Stack

| | |
|---|---|
| Frontend | React, Vite, D3.js |
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase) |
| Real-time | Socket.io |
| AI | Claude API (Anthropic) |
| Testing | Jest, Playwright |
| CI | GitHub Actions, ESLint |

---

## Getting Started

### Prerequisites

- Node.js v18+
- A Supabase project

### Clone the repository

```bash
git clone https://github.com/Sid504-dot/ModMapper_Orbital2026.git
cd ModMapper_Orbital2026
```

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
```

Supabase credentials can be found under **Project Settings → API** in your Supabase dashboard.

```bash
node index.js
```

The server runs at `http://localhost:3001`. Verify it is up with:

```bash
curl http://localhost:3001/health
```

### Frontend

Open a new terminal from the project root:

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Current Implementation

Authentication is fully functional — users can register and log in via Supabase Auth. The Express backend is live on Railway and exposes a `/health` endpoint alongside the auth routes. The React frontend is scaffolded and deployed on Vercel, with ESLint and a GitHub Actions CI pipeline in place.

---

## Deployment

| | Platform | URL |
|---|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | Supabase |

---

NUS CP2106 Independent Software Development Project (Orbital) 2026
