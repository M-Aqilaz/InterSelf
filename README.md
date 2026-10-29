# InterSelf

Gamified self-improvement web app: turn daily habits, tasks, and goals into a game with streaks, achievements, boss battles, and a social leaderboard.

## Features

- **Daily tasks and streaks**: one completion per task per day; the streak counts consecutive active days.
- **Achievements and inventory**: unlock badges, collect and use items (shields, boosts, boss orbs).
- **Boss battles and PvP**: bosses take damage from completed tasks and from energy strikes; friends can challenge each other.
- **Energy and gems**: energy regenerates 1 per hour, gems come from achievements, bosses, weekly challenges and 7-day streaks.
- **Friends and leaderboard**: friend requests and rankings.
- **Auth**: email/password, JWT session cookie, plus one-click demo accounts (no sign-up needed).
- **Onboarding and classes**: guided first run and class passives.
- **Share**: shareable achievement cards (html2canvas export).

## Tech Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, TypeScript
- **Prisma 5** + PostgreSQL
- **Tailwind CSS 4**, Radix UI, Framer Motion
- **Auth**: `jose` (JWT) + `bcryptjs`, **Validation**: Zod
- **Tests**: Vitest

## Getting Started

```bash
npm install
cp .env.example .env        # set DATABASE_URL and AUTH_SECRET
npx prisma generate
npx prisma migrate deploy   # or: npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random string, at least 32 characters in production |
| `DEMO_LOGIN_ENABLED` | Optional, `false` hides/disables the one-click demo (default on) |
| `APP_UTC_OFFSET_HOURS` | Optional, timezone used for "today" (default `7`, WIB) |

## Game rules

- **Day boundary**: midnight in the app timezone (default UTC+7). Daily tasks, streaks and the daily chest all use it.
- **Streak**: +1 for each day with at least one completed task. Missing a day resets it to 1, and the first task after the reset earns 20% less EXP. A **Streak Shield** covers exactly one missed day. The **Phantom** class keeps half of a broken streak.
- **Tasks**: each task can be completed once per day (enforced by a unique index, so double clicks and parallel requests cannot farm EXP).
- **Energy**: 1 per hour up to the maximum. Boss strikes spend energy on the server.
- **Boss**: hits have a 60 second cooldown. A defeated boss that comes back around starts with full HP.
- **Items**: XP Surge (+50% EXP, 2h), Coin Magnet (+50% coins, 1h), Boss Orb (500 damage), Streak Freeze (shield for 3 days).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Generate Prisma client and build for production |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (streak, energy, time, validation) |
| `npm run db:seed` | Seed tasks, items, bosses, achievements |

## Project Structure

- `app/`: routes, API endpoints (`app/api/*`), dashboard, auth, onboarding
- `components/`: `ui`, `forms`, `layout`, `motion`, `sections`
- `lib/`: game rules and server logic (`streak.ts`, `energy.ts`, `rewards.ts`, `boss.ts`, ...)
- `prisma/`: schema, migrations, seed
- `tests/`: unit tests for the pure game rules

## Notes

- Login and register are rate limited in memory per server instance. On serverless hosting, use a shared store (for example Upstash Redis) for a hard global limit.
- Sessions are stateless JWTs and cannot be revoked individually before they expire (7 days).

## Demo mode and deploying to Vercel

The login page has a **Coba Demo** button. Each click creates an isolated sandbox account (level 3, a 3 day streak, a few items) and signs the visitor in, so nobody can break anyone else's progress. Demo accounts older than 24 hours are deleted automatically.

To host it (for example behind a portfolio link):

1. Create a hosted PostgreSQL database (Neon, Supabase, or Vercel Postgres) and copy its connection string. Prefer the pooled/serverless URL.
2. In Vercel, import this repository and set `DATABASE_URL` and `AUTH_SECRET` (32+ random characters). Vercel runs `vercel-build`, which applies migrations before building.
3. Seed the game content once from your machine: `DATABASE_URL="<production url>" npx prisma db seed`.
4. Open `/login` and press **Coba Demo**.
