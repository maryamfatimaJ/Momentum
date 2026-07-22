# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-22

Initial release. Momentum is a full-stack, AI-powered habit tracker: a
polished React front end backed by real Supabase authentication, a
Postgres database with Row Level Security, and Google Gemini for
natural-language habit creation and coaching.

### Added

**Core habit tracking**
- Full habit CRUD: create, edit, pause, archive, and delete routines with
  custom categories, target values/units, frequencies, colors, and reminder
  times.
- Daily completion toggling and incremental progress tracking, with
  celebratory confetti and a soft completion chime.
- Dashboard with live streak, completion-rate, and today's-progress stats.
- Monthly calendar view plus a 12-month GitHub-style consistency heatmap.
- Streak engine with five progressive milestones (7/21/50/100/365 days)
  that unlock automatically as a real streak crosses each threshold.
- Behavioral analytics: weekly completions, category distribution, and a
  4-week momentum trend, all computed from real habit-log data.
- Daily micro-challenges with XP rewards.
- Settings: profile editing, theme toggle, full JSON data export, and a
  full progress reset.

**Authentication & accounts (Supabase Auth)**
- Real email/password sign up with email confirmation, login, logout, and
  password reset (request + in-app "set new password" flow).
- Session persistence across page reloads.
- Guest mode: the full app works fully offline-first via `localStorage`
  with no account required, and can be upgraded to a synced account at
  any time from Settings.

**Backend & data (Supabase Postgres)**
- Four core tables (`profiles`, `habits`, `habit_logs`, `milestones`) plus
  `daily_challenges` and `ai_coach_messages`, all protected by Row Level
  Security so a user can only ever read or write their own rows.
- Automatic per-user data seeding on first login (profile, default
  milestones, today's challenge).
- Background sync for every mutation (optimistic local update + Supabase
  write) so the UI never blocks on network round-trips.
- Live multi-tab/multi-device sync via Supabase Realtime for habits,
  habit logs, and milestones.
- Theme preference synced to the user's profile alongside `localStorage`.

**AI features (Google Gemini via a server-side proxy)**
- Natural-language habit creation ("Magic Habit").
- AI Habit Coach: contextual daily insight, a free-text chat that answers
  the user's actual question, and persisted conversation history for
  signed-in users.
- AI-generated weekly performance reviews.

**Design**
- Full light/dark mode, driven by a single toggle, applied consistently
  across every page, card, modal, and control, with the OS preference
  respected only when explicitly opted into (default is Light).
- Custom SVG/PNG favicon set built from the Momentum logo mark.
- Fully responsive layout from mobile through desktop.

### Fixed

Issues found and corrected during hardening, prior to this release:

- AI Coach chat previously ignored the user's typed question due to a
  request payload mismatch with the server; it now answers what was
  actually asked.
- Habit creation via natural language returned the wrong (previously
  most-recent) habit due to a stale-closure bug; it now returns the habit
  that was actually just created.
- Analytics previously showed a hardcoded monthly trend, a fixed "23-day"
  streak floor, and a hardcoded "best month" ("October"); all three are
  now computed from real log history.
- Sign-up used to redirect straight to the dashboard even when Supabase
  withheld the session pending email confirmation; it now correctly shows
  a "check your email" state instead of a false success.
- Clicking a password-reset email link previously had no way to actually
  set a new password; a proper "set new password" screen was added.
- Reloading the page while signed in used to strand the user on the
  marketing landing page instead of the dashboard, despite the Supabase
  session itself persisting correctly.
- A first-login race (surfaced by React StrictMode's double-effect
  invocation in development) could seed a new user's profile twice
  concurrently; seeding is now idempotent (`upsert`) and guarded.
- Milestone celebrations (confetti + sound) used to fire immediately on a
  fresh page load for any streak that already satisfied a threshold
  (including the seeded guest demo data), rather than only when a
  threshold is crossed live during the session.
- Three modals (sign-in, create habit, natural-language habit) could not
  be closed by clicking outside them, unlike every other overlay in the
  app; backdrop-click-to-close is now consistent across all modals.
- Removed several pre-existing unused imports and three orphaned landing
  page components that were never referenced from any route.

### Known limitations

- Google OAuth sign-in is implemented and was manually verified working,
  but is not exposed in this release's UI in favor of email/password only
  (see the codebase for the retained, disabled integration).
- No data-import flow yet (export only).
- The `/api/gemini/suggest-habits` endpoint is implemented server-side but
  not yet wired to a UI entry point.
