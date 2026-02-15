# RLS and Trip-Scoping

This document describes how trip-scoped data is protected in WeekendSync: which tables are trip-scoped, how RLS policies enforce access, and the requirement that API routes verify membership before operating on trip data.

## Rule for API routes

**Every API route under `app/api/trip/[tripId]/**` that reads or mutates trip-scoped data MUST call a membership check before performing the operation.**

- Use **`assertTripMember(supabase, tripId, me.user.id)`** from `@/lib/skills` when you already have a Supabase client and the current user. It throws if the user is not a member; catch and return `403 Forbidden`.
- Use **`requireTripMember(tripId)`** from `@/lib/auth/server` when you want a Supabase client plus the current user and need to fail the request if the user is not a member (e.g. in layouts or routes that need both).

Routes that need **organizer-only** actions (e.g. lock trip, replace weekend options) must still call a membership check first; then enforce organizer role (e.g. manual `trip_members` query for `role = 'organizer'` or use the result of `assertTripMember` which returns `role`).

## Trip-scoped tables

All of these tables are scoped by `trip_id` (or, for `trip_cost_splits`, indirectly via `trip_costs.trip_id`). RLS ensures that only trip members can read/write as described below.

| Table | Select | Insert | Update | Delete | Notes |
|-------|--------|--------|--------|--------|-------|
| **trips** | Members | Creator only | Organizer only | (cascade) | |
| **trip_members** | Members | Via `join_trip_by_invite` / create_trip | — | — | No direct insert from app; use RPC or definer functions. |
| **weekend_options** | Members | Via RPC `replace_weekend_options_for_sports` | Organizer only | — | |
| **availability** | Members | Own row, open trip | Own row, open trip | — | |
| **destination_options** | Members | Members, open trip | Organizer, open trip | — | |
| **votes_ranked** | Members | Own row, open trip | Own row, open trip | — | |
| **events** | Members | Members, open trip | — | — | |
| **event_saves** | Members | Own row, open trip | — | — | |
| **event_votes** | Members | Own row, open trip | Own row, open trip | — | |
| **trip_plan_items** | Members | Members, open trip | Members, open trip | Members, open trip | |
| **trip_costs** | Members | Members, open trip | Members, open trip | Members, open trip | |
| **trip_cost_splits** | Via trip_costs membership | Members, open trip | Members, open trip | Members, open trip | |
| **trip_logistics** | Members | Members, open trip | Members, open trip | Members, open trip | |

**Open trip:** Most mutations are allowed only when `trips.status = 'open'`. Locking the trip (`status = 'locked'`) is organizer-only and prevents further changes to options, votes, availability, etc.

## Helper functions (schema)

- **`public.is_trip_member(p_trip_id uuid)`** — Returns true if `auth.uid()` is in `trip_members` for that trip. Used by RLS policies. Security definer so it can read `trip_members` without being blocked by RLS.
- **`public.is_trip_organizer(p_trip_id uuid)`** — Returns true if the current user is a member with role `organizer`. Used by RLS for trips, weekend_options, and destination_options updates.

## Defense in depth

RLS alone would prevent unauthorized access at the database layer. The API-layer membership check (`assertTripMember` / `requireTripMember`) provides:

1. Consistent 401/403 behavior and error messages.
2. A single place to enforce “no trip access without membership” before any Supabase call.
3. Clear audit trail in code: every trip route either calls the helper or explicitly checks membership.

When adding or changing routes under `app/api/trip/[tripId]/**`, always add the membership check first, then implement the handler.
