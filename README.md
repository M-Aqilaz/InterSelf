# InterSelf

Gamified self-improvement web app — turn daily habits, tasks, and goals into a game with streaks, achievements, boss battles, and a social leaderboard.

## Features

- **Daily tasks & streaks** — track habits, keep learning streaks alive
- **Achievements & inventory** — unlock badges and collect items
- **Boss battles & PvP** — weekly challenges with progress tracking
- **Energy & gems** — in-app economy for shop and rewards
- **Friends & leaderboard** — friend requests, rankings, social motivation
- **Auth** — email/password login + registration (NextAuth-style flow)
- **Onboarding** — guided first-run experience
- **Share** — share achievement cards (html2canvas export)

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + TypeScript
- **Prisma 5** + PostgreSQL/SQLite
- **Tailwind CSS 4** + Radix UI + Framer Motion
- **Auth**: `jose` (JWT) + `bcryptjs`
- **Validation**: Zod

## Getting Started

```bash
npm install
cp .env.example .env        # set DATABASE_URL + auth secrets
npx prisma generate
npx prisma db push         # or: npm run db:seed
npm run dev
```

Open http://localhost:3000.

## Project Structure

- `app/` — routes, API endpoints (`app/api/*`), dashboard, auth, onboarding
- `components/` — `ui`, `forms`, `layout`, `motion`, `sections`
- `prisma/` — schema (`User`, `Task`, `Achievement`, `Boss`, `Friendship`, ...) + seed
- `lib/` — utilities and server logic

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Generate Prisma client + production build |
| `npm run lint` | ESLint |

## License

Internal product development for Intercomp.
