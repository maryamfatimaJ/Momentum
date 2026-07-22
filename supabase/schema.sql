-- Momentum: Supabase schema for real user accounts + persistent habit data.
-- Run this once in your Supabase project's SQL editor (Project -> SQL Editor -> New query).
--
-- This does NOT create any custom auth -- Supabase Auth (auth.users) handles
-- signup/login/sessions. These tables just hold each user's app data, scoped
-- by user_id and protected by Row Level Security so users can only ever
-- read/write their own rows.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Momentum User',
  email text not null,
  avatar_url text,
  theme text not null default 'light',
  notifications_enabled boolean not null default true,
  reminder_time text not null default '08:00',
  primary_goal text not null default 'Personal growth and daily consistency',
  joined_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  icon_name text not null,
  color text not null,
  frequency text not null,
  target_value numeric not null default 1,
  target_unit text,
  reminder_time text,
  notes text,
  is_paused boolean not null default false,
  is_archived boolean not null default false,
  created_at date not null default current_date
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null,
  current_value numeric not null default 0,
  completed boolean not null default false,
  notes text,
  unique (habit_id, date)
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  days int not null,
  title text not null,
  description text,
  icon_name text,
  unlocked boolean not null default false,
  unlocked_at date,
  unique (user_id, days)
);

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.milestones enable row level security;

drop policy if exists "Individuals can manage their own profile" on public.profiles;
create policy "Individuals can manage their own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Individuals can manage their own habits" on public.habits;
create policy "Individuals can manage their own habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Individuals can manage their own habit logs" on public.habit_logs;
create policy "Individuals can manage their own habit logs" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Individuals can manage their own milestones" on public.milestones;
create policy "Individuals can manage their own milestones" on public.milestones
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists habit_logs_user_id_idx on public.habit_logs (user_id);
create index if not exists habit_logs_habit_id_idx on public.habit_logs (habit_id);
create index if not exists milestones_user_id_idx on public.milestones (user_id);

-- ---------------------------------------------------------------------------
-- Migration 2: daily challenge persistence + AI Coach conversation history.
-- Safe to re-run this whole file -- every statement below is idempotent and
-- leaves existing tables/rows from Migration 1 untouched.
-- ---------------------------------------------------------------------------

create table if not exists public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  title text not null,
  description text,
  category text not null,
  xp_reward int not null default 0,
  completed boolean not null default false,
  unique (user_id, date)
);

create table if not exists public.ai_coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.daily_challenges enable row level security;
alter table public.ai_coach_messages enable row level security;

drop policy if exists "Individuals can manage their own daily challenges" on public.daily_challenges;
create policy "Individuals can manage their own daily challenges" on public.daily_challenges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Individuals can manage their own coach messages" on public.ai_coach_messages;
create policy "Individuals can manage their own coach messages" on public.ai_coach_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists daily_challenges_user_id_idx on public.daily_challenges (user_id);
create index if not exists ai_coach_messages_user_id_idx on public.ai_coach_messages (user_id, created_at);

-- ---------------------------------------------------------------------------
-- Migration 3: enable Realtime so habit/log/milestone changes on one device
-- (or browser tab) push live to any other open session for the same account.
-- Idempotent -- safe to re-run even if these tables are already published.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'habits'
  ) then
    alter publication supabase_realtime add table public.habits;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'habit_logs'
  ) then
    alter publication supabase_realtime add table public.habit_logs;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'milestones'
  ) then
    alter publication supabase_realtime add table public.milestones;
  end if;
end $$;
