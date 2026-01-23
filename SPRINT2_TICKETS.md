# WeekendSync Sprint 2 Tickets (Events)

This sprint focuses on Ticketmaster integration and events UX.
Each ticket is scoped to one concrete deliverable.

---

## Ticket 1 — Ticketmaster Search Proxy
- **Goal:** Server-side Ticketmaster search with normalized results.
- **Scope:** `GET /api/trip/[tripId]/events/search`
- **Done when:** Search returns normalized events for a city/date range.
- **Agent:** `INT_EventsTicketmaster`
- **Agent prompt:**
  - "Implement Ticketmaster search proxy with API key, normalized response, and membership check."

## Ticket 2 — Save Events
- **Goal:** Persist events and save them for the user.
- **Scope:** `POST /api/trip/[tripId]/events/save`
- **Done when:** Event is upserted and saved by the user.
- **Agent:** `API_RouteEngineer`
- **Agent prompt:**
  - "Implement save event endpoint with upsert into events + event_saves."

## Ticket 3 — Vote on Events
- **Goal:** Allow users to vote on saved events.
- **Scope:** `POST /api/trip/[tripId]/events/vote`
- **Done when:** Vote stored and vote count returned.
- **Agent:** `API_RouteEngineer`
- **Agent prompt:**
  - "Implement event vote upsert and return updated vote count."

## Ticket 4 — Fetch Saved Events
- **Goal:** Show shortlist with vote totals.
- **Scope:** `GET /api/trip/[tripId]/events/saved`
- **Done when:** Saved events include vote counts sorted by votes.
- **Agent:** `API_RouteEngineer`
- **Agent prompt:**
  - "Implement saved events endpoint including vote counts."

## Ticket 5 — Events Screen
- **Goal:** Search + shortlist + voting UX.
- **Scope:** `/trip/[tripId]/events`
- **Done when:** Users can search, save, and vote on events.
- **Agent:** `UI_FlowBuilder`
- **Agent prompt:**
  - "Build Events screen with search results, shortlist tab, and vote UI."

## Ticket 6 — Env + Config Validation
- **Goal:** Ensure env vars are present and documented.
- **Scope:** `TICKETMASTER_API_KEY` in env docs and validation.
- **Done when:** Missing key returns a clear error; docs include key.
- **Agent:** `GLUE_ContractsAndTypes`
- **Agent prompt:**
  - "Verify env validation and docs include TICKETMASTER_API_KEY."

