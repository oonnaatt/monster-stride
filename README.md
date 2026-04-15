# Monster Stride 🥚

A fitness game where your real-world runs, jogs, and walks hatch and evolve unique monsters. Your pace, biome, weather, time of day, and season all shape what creature emerges from the egg.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Fastify + TypeScript
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Monorepo**: pnpm workspaces

## Project Structure

```
monster-stride/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # Fastify backend
├── packages/
│   └── shared/       # Shared types & constants
├── supabase/
│   └── migrations/   # Database schema
├── pnpm-workspace.yaml
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- A [Supabase](https://supabase.com) project

### Setup

1. **Clone and install**
   ```bash
   git clone <repo>
   cd monster-stride
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example apps/api/.env
   cp .env.example apps/web/.env.local
   # Fill in your Supabase credentials in both files
   ```

3. **Run database migrations**
   Apply `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

4. **Start development servers**
   ```bash
   pnpm dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Game Mechanics

### 🥚 Egg Incubation
- **DEMO MODE**: Hatch a monster every **100 km** (production: 10,000 km)
- Your monster's type is shaped by the last **50 km** of activities (production: 1,000 km)

### 🐣 Monster Types
13 types determined by your activity context:
`Fire`, `Water`, `Earth`, `Wind`, `Electric`, `Nature`, `Ice`, `Shadow`, `Light`, `Mecha`, `Fog`, `Nocturnal`, `Void`

### ✨ Traits
Unlocked based on patterns in your activities:
- **Storm-Touched** — Mostly rain/storm weather
- **Lone Wolf** — Mostly night/midnight runs
- **Steadfast** — Always the same pace
- **Sprinter** — Has sprint activities
- **Early Riser** — Mostly dawn/morning
- **Wanderer** — 3+ different biomes
- **Summit Seeker** — >500m elevation gain total
- **Relentless** — Mostly run pace

### ⭐ EXP & Evolution
Tiers: `Hatchling → Juvenile → Adult → Elder → Ascended`

EXP is awarded based on:
- Distance × 10 (base)
- Pace match multiplier (same pace = 1.0×, off by 1 = 0.6×, off by 2+ = 0.25×)
- Biome match +25%
- Weather match +10%
- Time of day match +15%
- Streak bonus: +5% per day (max +50%)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/player-stats` | Get player stats |
| POST | `/api/activities` | Log an activity |
| GET | `/api/activities` | List activities |
| GET | `/api/monsters` | List monsters |
| GET | `/api/monsters/:id` | Get monster |
| PATCH | `/api/monsters/:id/name` | Rename monster |

## Deployment

### Prerequisites

- A [Supabase](https://supabase.com) project (database + auth)
- A [Render](https://render.com) account for the API (free, no credit card needed)
- A [Vercel](https://vercel.com) account for the frontend

### Render Setup (API)

1. Go to [render.com](https://render.com) and sign up (free, no credit card needed)
2. Click **New → Web Service** → connect your GitHub repo `oonnaatt/monster-stride`
3. Set **Root Directory** to leave blank (`render.yaml` at root will be detected automatically), or manually configure:
   - **Environment**: Docker
   - **Dockerfile Path**: `./apps/api/Dockerfile`
   - **Docker Context**: `.` (repo root)
4. Add environment variables in the Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALLOWED_ORIGINS` (your Vercel frontend URL)
5. Copy your **Service ID** (starts with `srv-`) from the service Settings page
6. Go to **Account Settings → API Keys** → create a key → copy it
7. Add `RENDER_API_KEY` and `RENDER_SERVICE_ID` as GitHub Actions secrets

> **Note:** Render's free tier spins the service down after 15 minutes of inactivity — the first request after idle will take ~30 seconds (cold start). This is normal on the free plan.

### GitHub Actions Secrets

Go to **Settings → Secrets and variables → Actions** in your GitHub repository and add the following secrets:

| Secret | Where to get it |
|--------|-----------------|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel → Project Settings |
| `VERCEL_PROJECT_ID` | Vercel → Project Settings |
| `RENDER_API_KEY` | Render dashboard → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | Render dashboard → your service → Settings → Service ID (starts with `srv-`) |
| `SUPABASE_ACCESS_TOKEN` | Supabase → Account → Access Tokens |
| `SUPABASE_PROJECT_REF` | Supabase → Project Settings → General |

### Vercel Environment Variables (Frontend)

Set these in your Vercel project settings:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://monster-stride-api.onrender.com
```

### CI/CD Pipeline

- **CI** (`.github/workflows/ci.yml`): Runs `pnpm install`, `pnpm build`, and `pnpm lint` on every push and pull request.
- **Deploy** (`.github/workflows/deploy.yml`): Triggered on merge to `main`:
  1. Builds and lints the full monorepo
  2. Deploys the frontend (`apps/web`) to **Vercel**
  3. Triggers the API (`apps/api`) deploy on **Render** via REST API
  4. Runs `supabase db push` to apply pending database migrations
