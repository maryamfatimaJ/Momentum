# Momentum

**Build Momentum. One Habit at a Time.**

A calm, editorial-styled habit tracker with real accounts, a real Postgres
database, and AI-powered habit creation and coaching. Guest mode works
fully offline in the browser; signing in syncs everything to the cloud
and across devices in real time.

## Features

- **Habit tracking** — custom categories, target metrics, colors, reminder
  times, streaks, and a GitHub-style 12-month consistency heatmap.
- **AI Habit Architect** — describe a habit in plain English ("read 20
  pages every night at 9pm") and Gemini configures it for you.
- **AI Habit Coach** — a daily insight, a free-text chat, and weekly
  performance reviews, all grounded in your real habit data.
- **Milestones** — 5 progressive streak milestones that unlock
  automatically as you cross each threshold.
- **Analytics** — weekly completions, category distribution, and momentum
  trend charts computed from real data.
- **Real accounts** — email/password auth via Supabase, with email
  verification, password reset, and session persistence.
- **Full dark mode** — a single toggle, applied consistently everywhere,
  synced to your account.
- **Guest mode** — the entire app works with zero account, backed by
  `localStorage`; sign in any time to sync to the cloud without losing data.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Framer
  Motion (`motion`), Recharts, Lucide icons.
- **Backend:** Express (serves the Vite app in dev, static build in
  production, and proxies AI requests).
- **Database & Auth:** Supabase (Postgres + Row Level Security + Auth +
  Realtime).
- **AI:** Google Gemini via `@google/genai`, called only from the server.

## Getting Started

**Prerequisites:** Node.js 18+.

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:

| Variable | Required for | Notes |
|---|---|---|
| `GEMINI_API_KEY` | AI features | From [Google AI Studio](https://aistudio.google.com/) |
| `VITE_SUPABASE_URL` | Real accounts/sync | From your Supabase project settings |
| `VITE_SUPABASE_ANON_KEY` | Real accounts/sync | Safe to expose to the browser — RLS enforces access |

The app runs fully in **guest mode** (no account, `localStorage` only) even
without the Supabase variables set.

If you want real accounts, create a free project at
[supabase.com](https://supabase.com) and run `supabase/schema.sql` once in
its SQL editor. See `DATABASE_SCHEMA.md` for details.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Express + Vite, hot reload) |
| `npm run lint` | Type-check the project |
| `npm run build` | Production build to `dist/` |
| `npm start` | Run the production build |

## Documentation

- [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) — folder layout and architecture
- [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) — server endpoints
- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) — Supabase tables, RLS, and setup
- [`DEVELOPMENT_GUIDE.md`](DEVELOPMENT_GUIDE.md) — local dev, testing, deployment
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution guidelines
- [`CHANGELOG.md`](CHANGELOG.md) — release history

## License

MIT — see [`LICENSE`](LICENSE).
