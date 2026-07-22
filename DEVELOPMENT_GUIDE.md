# Development Guide

## Local Development

```bash
npm install
cp .env.example .env   # fill in GEMINI_API_KEY and/or Supabase vars
npm run dev
```

The dev server (`server.ts`, via `tsx`) runs Express with Vite mounted as
middleware — one process, hot module reload included, served at
`http://localhost:3000`.

You do **not** need Supabase configured to develop most of the app: with
no `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` set, the app runs entirely
in guest mode against `localStorage`, and a console warning notes Supabase
isn't configured. AI features (`GEMINI_API_KEY`) are independent of that —
set it to test habit creation, the AI Coach, and weekly reviews.

## Manual Test Checklist

There's no automated test suite yet, so verify changes manually. A
reasonable pass before opening a PR:

**Guest mode**
- [ ] Create, edit (pause/archive), and delete a habit
- [ ] Toggle completion and adjust numeric progress
- [ ] Natural-language habit creation ("Magic Habit")
- [ ] Calendar and Analytics render with real data, no console errors
- [ ] AI Coach: refresh insight, ask a question in chat
- [ ] Toggle theme; reload — it should persist
- [ ] Export data (JSON download)

**Authenticated mode** (requires Supabase configured)
- [ ] Sign up → confirm email → login → logout → login again
- [ ] Password reset: request email → click link → set new password → login with it
- [ ] Habit created while signed in appears in Supabase (check the table
      directly, or reload the page and confirm it's still there)
- [ ] Open the app in two tabs signed into the same account — a change in
      one should appear in the other without reloading (Realtime)
- [ ] Sign out returns to guest state cleanly

**Cross-cutting**
- [ ] Dark mode looks correct on every page you touched (no invisible
      text, no stray white/light boxes)
- [ ] Resize to a mobile width (~390px) — layout should not break
- [ ] Browser console has no errors on any page you touched

## Type-Checking & Build

```bash
npm run lint    # tsc --noEmit
npm run build   # production build to dist/
npm start       # run the production build locally
```

A single "chunk larger than 500 kB" warning from `vite build` is expected
and harmless (no code-splitting has been set up yet) — anything beyond
that warning should be treated as a real issue.

## Debugging Supabase Issues

- **"Supabase is not configured" console warning** — `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
  aren't set; expected in guest-only development.
- **`relation "public.<table>" does not exist`** — `supabase/schema.sql`
  hasn't been run against your project yet.
- **RLS policy violation on insert/update** — you're trying to write a row
  with a `user_id` that doesn't match the current session's `auth.uid()`;
  this is RLS working correctly, not a bug.
- **`Unsupported provider: provider is not enabled`** on an OAuth
  attempt — the provider needs to be toggled on and saved (not just
  filled in) under Authentication → Providers in the Supabase dashboard.

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Framework preset: **Vite**. Build command: `npm run build`. Output
   directory: `dist`.
4. Since this app also needs a small Node server for the Gemini proxy
   endpoints (not just static files), the Express server (`server.ts` /
   `dist/server.cjs`) needs to run somewhere — either as a Vercel Node
   serverless function wrapping the same routes, or deploy the static
   `dist/` output to Vercel and the Express API separately (e.g. a small
   Node host) if you don't adapt `server.ts` into `/api` functions.
5. Add environment variables in the Vercel project settings:
   `GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
6. After deploying, add your production URL to Supabase's
   **Authentication → URL Configuration → Redirect URLs** if you use any
   redirect-based auth flow (password reset, OAuth).
