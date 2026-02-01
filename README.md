# WeekendSync

WeekendSync is a Next.js app backed by Supabase (Auth + Postgres + RLS).

## Supabase setup

### 1) Create a Supabase project

- Create a new Supabase project in the Supabase dashboard.
- Copy the project **URL** and **anon key** (Project Settings → API).

### 2) Configure environment variables

Create `.env.local` (you can start from `env.example`):

- **`NEXT_PUBLIC_SUPABASE_URL`**: your Supabase project URL
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: your Supabase anon key (safe to expose to the browser; RLS protects data)
- **`SUPABASE_SERVICE_ROLE_KEY`** (optional): only needed for server-only admin operations (never expose to the browser)
- **`TICKETMASTER_API_KEY`** (optional): only needed for Ticketmaster search features

### 3) Configure Supabase Auth (magic link)

This app signs in with email OTP (magic links) and expects the callback route:

- **Redirect URL**: `http://localhost:3000/auth/callback`

In Supabase dashboard:

- Authentication → URL Configuration:
  - **Site URL**: `http://localhost:3000`
  - **Redirect URLs**: add `http://localhost:3000/auth/callback`

If you deploy, also add your production URL + `/auth/callback` redirect URL.

### 4) Apply the database schema + RLS

Run the SQL in `db/schema.sql` in Supabase SQL editor (Database → SQL editor).

That file creates:

- **Core Tables**: `profiles`, `trips`, `trip_members`, `availability`, `destination_options`, `votes_ranked`, `events`, `event_saves`, `event_votes`
- **Planning Tables** (NEW): `trip_plan_items`, `trip_costs`, `trip_cost_splits`, `trip_logistics`
- **RLS policies** (members-only access with proper permissions)
- **RPC functions**:
  - `public.create_trip(p_name text, p_first_date date, p_lookahead_weeks int, p_timeframe_mode text, p_trip_length_days int)`
  - `public.join_trip_by_invite(p_invite_code text)`
  - `public.recompute_weekend_scores(p_trip_id uuid)`

### 5) Run the app

```bash
npm run dev
```

Then:

- Visit `/sign-in` to request a magic link
- After sign-in you'll be routed to `/onboarding` to create your `profiles` row (required before creating/joining trips)
- Create a trip and you'll be taken to the new **Trip Plan** page where you can:
  - View trip overview and share invite codes
  - Add itinerary items with dates, locations, and reminders
  - Track costs with per-person splits
  - Add lodging and transport details
  - Manage trip privacy and emergency contacts

## Features

### Trip Planning MVP (New!)
- **Plan Tab**: Day-by-day itinerary with items, reminders, and assignments
- **People Tab**: View members, share invites via code or link
- **Costs Tab**: Track expenses with automatic balance calculations
- **Overview Tab**: Trip summary, privacy settings, emergency contacts, logistics

### Core Features
- Availability coordination for weekend trips
- Ranked choice voting for weekends and destinations
- Event discovery and saving (Ticketmaster integration)
- Trip dashboard with progress tracking
- Calendar export (.ics files)

### Advanced Features
- **Offline Support**: Cache trip data and queue edits for sync
- **Notifications**: Web notifications for reminders and invites
- **Privacy Controls**: Code-only or invite-only trip access
- **Cost Splitting**: Automatic per-person balance calculations

## Agent Skills (Contributors)

WeekendSync uses Cursor Agent Skills for consistent AI assistance. Project wrappers live in `.cursor/skills/` and are version-controlled. For best results, also install the full skills globally into `~/.codex/skills/` (or `~/.cursor/skills/`):

- nextjs
- supabase-postgres-best-practices
- user-journeys
- user-onboarding
- accessibility-compliance-accessibility-audit
- ux-writing
- playwright-cli
- vitest

Use the skill-installer or copy from [openai/skills](https://github.com/openai/skills) / other skill repos. See `AGENTS.md` for when each skill applies.

