# Project Structure

```
momentum/
├── public/                        # Static assets served as-is (favicon set, manifest)
├── supabase/
│   └── schema.sql                 # Postgres schema, RLS policies, Realtime publication (idempotent)
├── src/
│   ├── main.tsx                   # React root
│   ├── App.tsx                    # Top-level: landing page vs. DashboardLayout switch, AuthModal host
│   ├── index.css                  # Tailwind import, dark-mode variant config, custom utility classes
│   ├── types.ts                   # All shared TypeScript interfaces (Habit, UserProfile, AI shapes, ...)
│   ├── vite-env.d.ts              # Vite client type reference (import.meta.env typing)
│   │
│   ├── context/
│   │   └── HabitContext.tsx       # THE app's state: habits, logs, profile, milestones, auth, AI calls,
│   │                              # theme, Supabase sync — everything lives in this one provider
│   │
│   ├── lib/
│   │   ├── supabaseClient.ts      # Supabase client singleton + `isSupabaseConfigured` guard
│   │   └── supabaseMappers.ts     # camelCase (app) <-> snake_case (Postgres) row mapping helpers
│   │
│   ├── data/
│   │   └── initialData.ts         # Seed data: preset habits, quotes, challenge pool, default milestones/profile
│   │
│   ├── utils/
│   │   └── habitUtils.ts          # Date helpers, streak/completion-rate math, confetti + sound triggers
│   │
│   └── components/
│       ├── common/                # Shared across landing + dashboard
│       │   ├── Logo.tsx
│       │   ├── Navbar.tsx
│       │   └── Footer.tsx
│       │
│       ├── landing/                # Marketing/landing page sections (rendered when logged out / guest)
│       │   ├── SpotlightHero.tsx   # Animated canvas hero (own light/dark palette, not Tailwind-driven)
│       │   ├── Features.tsx
│       │   ├── AISection.tsx       # Interactive "try natural language habit creation" demo
│       │   ├── Statistics.tsx
│       │   ├── FAQ.tsx
│       │   └── DashboardPreviewModal.tsx
│       │
│       ├── auth/
│       │   └── AuthModal.tsx      # Sign in / sign up / forgot password / set-new-password, all one modal
│       │
│       ├── dashboard/
│       │   ├── DashboardLayout.tsx # App shell: top nav, tab routing, hosts all modals + AI Coach button
│       │   ├── HeaderGreeting.tsx  # Greeting + 3 stat cards
│       │   ├── TodayHabits.tsx     # Filterable list of today's habits
│       │   ├── HabitItem.tsx       # Single habit row (checkbox, progress +/-)
│       │   ├── DailyChallengeWidget.tsx
│       │   └── AICoachWidget.tsx   # Floating button + slide-over drawer (insight, chat, refresh)
│       │
│       ├── habits/
│       │   ├── HabitStackView.tsx  # Manage habits: active/paused/archived, presets
│       │   ├── CreateHabitModal.tsx
│       │   └── NaturalLanguageHabitModal.tsx
│       │
│       ├── calendar/
│       │   └── CalendarView.tsx    # Month grid + 12-month heatmap
│       │
│       ├── streaks/
│       │   └── StreakView.tsx      # Streak stats + milestone badges
│       │
│       ├── analytics/
│       │   └── AnalyticsView.tsx   # Recharts: weekly bar, category pie, monthly trend
│       │
│       └── settings/
│           └── SettingsView.tsx    # Account & sync, profile, theme, export/reset
│
├── server.ts                       # Express: Gemini AI proxy endpoints + Vite dev middleware / static prod serving
├── index.html                      # Vite entry, favicon links, pre-paint theme script
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Architecture Notes

- **Single context, no reducer/query library.** `HabitContext.tsx` owns every
  piece of app state and every action. Components read/write through
  `useHabitContext()` — there's no prop drilling and no separate data-fetching
  layer.
- **Guest-first, cloud-optional.** Every piece of state initializes from
  `localStorage` and works with zero backend. When a Supabase session exists,
  the same state is additionally loaded from and synced to Postgres
  (optimistic local update, background write) — guest and authenticated code
  paths share the same component tree and actions.
- **No client-side router.** Navigation is two pieces of context state:
  `isLandingPage` (marketing vs. app) and `activeTab` (which dashboard tab).
  There's no URL-based routing.
- **AI stays server-side.** `server.ts` is the only place `GEMINI_API_KEY` is
  read; the client only ever calls same-origin `/api/gemini/*` routes.
- **Security is enforced at the database, not just the client.** Every
  Supabase table has Row Level Security policies keyed on `auth.uid()` — the
  client-side Supabase key is the public anon key, safe to expose, because
  RLS (not application code) is what actually prevents cross-user access.
