# API Documentation

All endpoints are served by the Express app in `server.ts`, same-origin
(`/api/...`). There is no authentication middleware on these routes — they
are stateless AI proxies that never touch user data directly; all
persistence goes through Supabase (see `DATABASE_SCHEMA.md`), called
directly from the client under Row Level Security.

`GEMINI_API_KEY` is read only on the server and never sent to the client.

## `GET /api/health`

Health check.

**Response `200`**
```json
{ "status": "ok", "app": "Momentum AI Habit Tracker" }
```

---

## `POST /api/gemini/parse-habit`

Parses a natural-language habit description into a structured habit object.
Backs the "AI Habit Architect" / "Magic Habit" feature.

**Request body**
```json
{ "prompt": "Read 20 pages of non-fiction every night before bed" }
```

**Response `200`**
```json
{
  "success": true,
  "habit": {
    "title": "string",
    "category": "Fitness | Mindset | Health | Focus | Growth | Wellness",
    "iconName": "string (Lucide icon name)",
    "color": "string (hex)",
    "frequency": "Daily | Weekly | Monthly",
    "targetValue": "number",
    "targetUnit": "string",
    "reminderTime": "string (HH:MM, optional)",
    "notes": "string (optional)"
  }
}
```

**Errors**
- `400` — missing/invalid `prompt`.
- `500` — Gemini call failed (includes `error` message).

---

## `POST /api/gemini/coach-insight`

Generates the AI Habit Coach's headline insight, tactical tip, and recovery
plan for the drawer's static insight section.

**Request body**
```json
{
  "habits": [{ "title": "string", "category": "string" }],
  "currentStreak": "number",
  "completionRate": "number",
  "missedHabits": ["string"],
  "userGoal": "string"
}
```

**Response `200`**
```json
{
  "success": true,
  "coach": {
    "headline": "string",
    "insight": "string",
    "tip": "string",
    "recoveryPlan": "string",
    "detectedWeakness": "string (optional)",
    "motivationalQuote": "string"
  }
}
```

---

## `POST /api/gemini/ask-coach`

Answers a free-text question from the AI Coach chat, grounded in the
user's current stats.

**Request body**
```json
{
  "question": "string",
  "currentStreak": "number",
  "completionRate": "number",
  "activeHabitsCount": "number"
}
```

**Response `200`**
```json
{ "success": true, "reply": "string (2-4 sentences)" }
```

**Errors**
- `400` — missing/invalid `question`.
- `500` — Gemini call failed.

---

## `POST /api/gemini/weekly-review`

Generates an AI weekly performance review from recent completion history.

**Request body**
```json
{
  "historyData": [{ "habitId": "string", "date": "YYYY-MM-DD", "completed": "boolean" }],
  "activeHabitsCount": "number"
}
```

**Response `200`**
```json
{
  "success": true,
  "review": {
    "summary": "string",
    "scoreGrade": "string (e.g. \"A+\")",
    "strongestHabit": "string",
    "focusArea": "string",
    "recommendations": ["string", "string", "string"]
  }
}
```

---

## `POST /api/gemini/suggest-habits`

Suggests 4 high-impact habits tailored to a stated interest. Implemented
and functional, but not currently wired to any UI entry point.

**Request body**
```json
{ "userInterest": "string" }
```

**Response `200`**
```json
{
  "success": true,
  "suggestions": [
    {
      "title": "string",
      "category": "string",
      "iconName": "string",
      "color": "string",
      "targetValue": "number",
      "targetUnit": "string",
      "reasoning": "string"
    }
  ]
}
```

---

## Error shape

All endpoints return errors as:
```json
{ "error": "string" }
```
with an appropriate HTTP status code (`400` for bad input, `500` for
upstream/Gemini failures).

## Data endpoints

There are none — habits, logs, profiles, milestones, daily challenges, and
AI coach conversation history are all read and written **directly from the
client to Supabase** via `@supabase/supabase-js`, protected by Row Level
Security policies rather than server-side route handlers. See
`DATABASE_SCHEMA.md` for the full schema and policies.
