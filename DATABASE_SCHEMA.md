# Database Schema

Momentum uses Supabase (Postgres) for accounts and persistence. The full,
authoritative, idempotent schema lives in [`supabase/schema.sql`](supabase/schema.sql)
— this document explains it; the SQL file is what you actually run.

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the entire contents of
   `supabase/schema.sql`, and run it. It's safe to re-run at any time —
   every statement is `if not exists` / idempotent.
3. Copy your project's URL and anon/publishable key into `.env` as
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. (Optional) In **Authentication → Providers**, enable additional sign-in
   providers if you want them — the app currently exposes email/password
   only, but the Supabase side supports adding more without any app code
   changes to the sync layer.

No service-role key is needed by the application — every table is
accessed directly from the browser using the public anon key, with **Row
Level Security as the actual security boundary**.

## Tables

### `profiles`
One row per user, mirrors `auth.users`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `= auth.users.id`, cascades on user deletion |
| `name` | `text` | default `'Momentum User'` |
| `email` | `text` | |
| `avatar_url` | `text` | nullable |
| `theme` | `text` | `'light'` \| `'dark'`, synced with the app's theme toggle |
| `notifications_enabled` | `boolean` | default `true` (stored; no delivery mechanism built yet) |
| `reminder_time` | `text` | `HH:MM`, default `'08:00'` |
| `primary_goal` | `text` | free text, used as AI Coach context |
| `joined_date` | `date` | |
| `created_at` | `timestamptz` | |

### `habits`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users` | cascades on delete |
| `title`, `category`, `icon_name`, `color`, `frequency` | `text` | |
| `target_value` | `numeric` | |
| `target_unit`, `reminder_time`, `notes` | `text` | nullable |
| `is_paused`, `is_archived` | `boolean` | default `false` |
| `created_at` | `date` | |

### `habit_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users` | cascades on delete |
| `habit_id` | `uuid` FK → `habits` | cascades on delete (deleting a habit removes its logs) |
| `date` | `date` | |
| `current_value` | `numeric` | |
| `completed` | `boolean` | |
| `notes` | `text` | nullable |
| — | | `unique (habit_id, date)` — one log per habit per day; the app `upsert`s on this |

### `milestones`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users` | |
| `days` | `int` | threshold (7 / 21 / 50 / 100 / 365) |
| `title`, `description`, `icon_name` | `text` | |
| `unlocked` | `boolean` | flipped automatically when a live streak crosses `days` |
| `unlocked_at` | `date` | nullable |
| — | | `unique (user_id, days)` |

### `daily_challenges`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users` | |
| `date` | `date` | |
| `title`, `description`, `category` | `text` | |
| `xp_reward` | `int` | |
| `completed` | `boolean` | |
| — | | `unique (user_id, date)` — one challenge per user per day |

### `ai_coach_messages`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `auth.users` | |
| `role` | `text` | `check (role in ('user', 'assistant'))` |
| `content` | `text` | |
| `created_at` | `timestamptz` | ordered by this for chat history |

## Row Level Security

Every table has RLS **enabled**, with a single permissive policy:

```sql
for all using (auth.uid() = user_id) with check (auth.uid() = user_id)
```

(`profiles` uses `auth.uid() = id` since its primary key *is* the user id.)

This means: with the public anon key and no session, every query on every
table returns zero rows and every write is rejected. With a valid session,
a user can only ever read/write rows where `user_id` (or `id`, for
profiles) matches their own `auth.uid()` — verified directly against the
live database during development (unauthenticated reads return `[]`,
cross-user writes return a `42501` policy violation).

## Realtime

`habits`, `habit_logs`, and `milestones` are added to the
`supabase_realtime` publication, so changes made on one device or browser
tab push live to any other open session for the same account via a
Postgres Changes subscription — verified working across two concurrent
sessions.

## Seeding

New users are seeded **client-side**, not via a database trigger: the
first time `HabitContext` sees a session with no existing `profiles` row,
it inserts one (populated from the auth provider's name/avatar metadata
when available) and seeds the 5 default `milestones` rows (all
`unlocked: false`) and today's `daily_challenges` row. Habits are
intentionally left empty for a new account — the Habit Stack view's
preset list and empty state cover onboarding.
