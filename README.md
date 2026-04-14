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
