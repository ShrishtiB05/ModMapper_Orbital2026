# ModMapper_Orbital2026

# ModMapper

A collaborative timetable planner for NUS students. Search modules, build conflict-free schedules through a constraint solver, and sync plans with friends in real time.

**Live:** [modmapper.vercel.app](https://modmapper.vercel.app/login)

---

## Features

- AI-Powered Timetable Generator
Parses natural-language preferences like "no morning classes" into constraints using the Claude API. Generates and ranks valid, non-clashing schedules with a visual side-by-side comparison.

- 4-Year Academic Planner
Maps out your entire degree using a curated graduation requirement database and prerequisite logic. Features a drag-and-drop grid that prevents invalid module placements across semesters.

- Crowdsourced Bidding Demand Heatmap
Visualizes anonymous, real-time planning intent from other users as a color-coded timetable overlay. Helps you gauge competition for specific slots before the actual bidding window opens.

- S/U Optimizer with AI Explanation
Identifies S/U-eligible modules and uses historical difficulty data to recommend the best grade-masking strategy. Provides plain-English reasoning on how each choice impacts your target CAP.

- Planner-Gated Module Q&A
Provides a persistent, searchable community forum where posting access is restricted to current or past students. Ensures high-quality, verified peer advice that survives beyond ephemeral chat groups.

- Peer-Informed UE/PE Recommender
Matches your interests to modules using AI, enriched with major-specific workload and enjoyment scores. Allows instant "Add to Planner" functionality with automated prerequisite checks.

- Group Free Slot Finder
Aggregates friend schedules via shareable links to identify optimal meeting windows for project work. Displays the nearest classes for each person to provide geographic and temporal context.

- AI Study Planner
Automatically wraps a weekly revision schedule around your timetable based on module weightage and exam dates. Learns from your behavior, adjusting future suggestions when you skip or complete blocks.

- Interactive Prerequisite Visualizer
Uses a D3.js force-directed graph to map out your entire degree's dependency tree. Highlights double-counting opportunities and color-codes modules by completion and eligibility status.

- AI Workload Balancer & Danger Zones
Identifies "danger zones" where deadlines and exams cluster to predict your weekly stress levels. Suggests module swaps to smooth out your semester load and calculates downstream impacts.

- What-If Scenario Planner
Enables side-by-side comparisons of major pivots, such as adding a second major or going on exchange. Evaluates feasibility, graduation timelines, and workload differences across different "what-if" branches.

---

## Tech Stack

| | |
|---|---|
| Frontend | React, Vite, D3.js |
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase) |
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

| | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | Supabase (Asia-Pacific) |

---

NUS CP2106 Independent Software Development Project (Orbital) 2026
