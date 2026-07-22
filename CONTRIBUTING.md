# Contributing to Momentum

Thanks for your interest in contributing! This guide covers how to get set
up, how the project is structured, and what's expected of a pull request.

## Project Setup

**Prerequisites:** Node.js 18+ and npm.

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/maryamfatimaJ/Momentum.git
   cd Momentum
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values:
   - `GEMINI_API_KEY` — required for AI features (habit creation, coach, reviews).
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — required for real accounts
     and persistence. Without these the app still runs fully in local-only
     guest mode.
3. If you're setting up a fresh Supabase project, run `supabase/schema.sql`
   in the Supabase SQL editor once (see `DATABASE_SCHEMA.md`).
4. Start the dev server:
   ```bash
   npm run dev
   ```
   The app serves at `http://localhost:3000`.

## Development Workflow

- `npm run dev` — start the Express + Vite dev server (hot reload enabled).
- `npm run lint` — type-check the project (`tsc --noEmit`).
- `npm run build` — production build (outputs to `dist/`).
- `npm start` — run the production build locally.

There is no test suite yet — verify changes manually against the golden
path and edge cases for whatever you touch (see `DEVELOPMENT_GUIDE.md` for
a suggested manual test checklist).

## Coding Standards

- **TypeScript everywhere.** Avoid `any` unless you have a specific reason;
  prefer narrowing or a proper type.
- **Match the existing style.** This codebase favors small, focused
  components, Tailwind utility classes directly in JSX (no CSS modules),
  and Lucide icons for all iconography.
- **No unnecessary abstraction.** Don't introduce a helper, hook, or
  wrapper for something used once. Three similar lines beat a premature
  abstraction.
- **Comments explain *why*, not *what*.** Only comment on non-obvious
  constraints, workarounds, or invariants — well-named code should make the
  "what" obvious on its own.
- **Dark mode.** Any new UI must include a `dark:` variant for every
  color-related class (background, text, border) — see existing components
  for the established color mapping.
- **Security.** Never commit secrets. All Supabase table access must go
  through Row Level Security — never bypass it client-side. All AI calls
  must stay server-side (through `server.ts`), never expose `GEMINI_API_KEY`
  to the client.

## Branch Strategy

- `main` is always deployable.
- Create feature branches off `main` using the pattern:
  `feature/<short-description>`, `fix/<short-description>`, or
  `chore/<short-description>` (e.g. `fix/password-reset-flow`).
- Rebase on `main` before opening a pull request to keep history linear.

## Commit Message Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

<optional longer description>
```

Common types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`.

Examples:
```
feat(auth): add password reset completion screen
fix(analytics): compute monthly trend from real log data
docs: update database schema for daily_challenges table
```

Write commit messages that explain *why* a change was made, not just what
changed — the diff already shows the what.

## Pull Request Guidelines

- Keep PRs focused on a single concern; avoid bundling unrelated changes.
- Describe what changed and why in the PR description — link any relevant
  issue.
- Confirm before requesting review that:
  - `npm run lint` and `npm run build` both pass.
  - You manually tested the change in a browser (guest mode at minimum;
    authenticated mode if the change touches Supabase).
  - No `.env`, API keys, or other secrets are included in the diff.
- Be ready to explain trade-offs — especially for anything touching
  authentication, RLS policies, or the AI endpoints.
