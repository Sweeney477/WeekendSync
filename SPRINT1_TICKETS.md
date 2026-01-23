# WeekendSync Sprint 1 Tickets (First Weekend Build)

This backlog is optimized for one-step-at-a-time, vibe-coding in Cursor.
Each ticket has a clear goal, scope, and a suggested agent prompt.

---

## Ticket 1 — Auth Happy Path
- **Goal:** Email OTP sign-in works, profile row exists.
- **Scope:** `/app/(auth)/sign-in`, `/app/auth/callback`, `profiles` upsert.
- **Done when:** User signs in and `profiles.display_name` is set.
- **Agent:** `API_RouteEngineer` + `UI_FlowBuilder`
- **Agent prompt:**
  - "Implement minimal email OTP sign-in UI and callback handling. Ensure profile row exists and onboarding captures display_name. Keep scope to auth only."

## Ticket 2 — Create Trip Endpoint
- **Goal:** `POST /api/trips` creates trip + organizer membership + weekends.
- **Scope:** API route + `create_trip` RPC + weekend generation.
- **Done when:** Endpoint returns trip id + invite URL.
- **Agent:** `API_RouteEngineer`
- **Agent prompt:**
  - "Implement POST /api/trips to create trip, add organizer membership, generate weekend options. Return invite link."

## Ticket 3 — New Trip Flow UI
- **Goal:** Create trip from UI and navigate to dashboard.
- **Scope:** `/trips/new` page + POST call + redirect.
- **Done when:** Create → lands on `/trip/[tripId]/dashboard`.
- **Agent:** `UI_FlowBuilder`
- **Agent prompt:**
  - "Build /trips/new page to collect trip name and submit to POST /api/trips. Redirect to trip dashboard."

## Ticket 4 — Trip Dashboard Shell
- **Goal:** Show member count + availability completion + CTA.
- **Scope:** `/trip/[tripId]/dashboard` UI + data fetch.
- **Done when:** Dashboard shows counts and “Continue” CTA.
- **Agent:** `UI_FlowBuilder`
- **Agent prompt:**
  - "Build dashboard shell with member count, availability completion, and a Continue button to availability."

## Ticket 5 — Availability UI
- **Goal:** Render weekends and toggle Yes/Maybe/No.
- **Scope:** `/trip/[tripId]/availability` page UI.
- **Done when:** Taps cycle states locally.
- **Agent:** `UI_FlowBuilder`
- **Agent prompt:**
  - "Build availability grid UI with weekend cards. Tapping cycles Yes/Maybe/No/Unset."

## Ticket 6 — Availability Upsert
- **Goal:** Persist availability per user.
- **Scope:** `POST /api/trip/[tripId]/availability`, `assertTripMember`.
- **Done when:** Refresh persists selections.
- **Agent:** `API_RouteEngineer`
- **Agent prompt:**
  - "Implement availability upsert route with membership check. Save per-user per-weekend availability."

## Ticket 7 — Ranked Weekends Endpoint
- **Goal:** Compute ranked weekends for the group.
- **Scope:** `GET /api/trip/[tripId]/weekends`, `scoreAvailability`.
- **Done when:** Endpoint returns ranked list with counts.
- **Agent:** `API_RouteEngineer`
- **Agent prompt:**
  - "Build ranked weekends endpoint. Query availability + members, compute scores via scoreAvailability."

## Ticket 8 — Best Weekends Screen
- **Goal:** Show ranked weekends list.
- **Scope:** `/trip/[tripId]/weekends` UI.
- **Done when:** Ranked weekends render with counts.
- **Agent:** `UI_FlowBuilder`
- **Agent prompt:**
  - "Build best weekends screen listing ranked options and overlap counts."

