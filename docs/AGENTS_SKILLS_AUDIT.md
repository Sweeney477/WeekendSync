# AGENTS.md Skills Audit — Full Codebase

This report applies the skills and stack from [AGENTS.md](../AGENTS.md) to the WeekendSync codebase. It summarizes alignment and lists actionable improvements.

---

## 1. Next.js / nextjs-app-router-patterns

**Aligned**

- **Async params**: All dynamic routes use `params: Promise<{ tripId: string }>` (or `{ inviteCode: string }`, `{ itemId: string }` where applicable). No sync params in app routes or API routes.
- **Layouts**: Root layout and trip layout are server components; trip layout uses `requireTripMember` and fetches trip data server-side.
- **Route groups**: `(auth)`, `(public)` used correctly. Trip routes under `app/trip/[tripId]/` with shared layout.
- **Error boundaries**: `app/error.tsx` and `app/trip/[tripId]/error.tsx` present with reset and navigation.
- **Loading**: `app/trip/[tripId]/dashboard/loading.tsx` uses Skeleton for dashboard; other heavy routes (plan, events, voting, etc.) do not yet have `loading.tsx`.

**Improvements**

- Add `loading.tsx` for high-traffic or slow routes: plan, events, voting, availability, weekends, summary.
- Consider `template.tsx` only if you need re-mounting on navigation (often not needed).

---

## 2. Supabase / supabase-postgres-best-practices

**Aligned**

- **Server client**: `lib/supabase/server.ts` uses `@supabase/ssr`, `cookies()`, and optional `allowCookieWrites` for layout reads.
- **Auth + membership**: API routes use `createServerSupabaseClient()` and `assertTripMember` / `requireTripMember`; RLS is enforced via membership checks and DB policies.
- **Schema**: `db/schema.sql` — tables have PKs, FKs, check constraints, and indexes on common filters (e.g. `trip_id`, `user_id`, `invite_code`). RLS enabled on all relevant tables. Helper functions `is_trip_member` / `is_trip_organizer` are security definer where needed.
- **Validation**: Request bodies validated with Zod in API routes (e.g. `app/api/trip/[tripId]/route.ts` with `guidedUpdateSchema`).

**Improvements**

- Ensure every API route that mutates trip-scoped data uses `assertTripMember` (or equivalent) and that RLS policies cover all access paths.
- Document or add a single place that lists which tables are trip-scoped and which policies apply (for security-auditor and future changes).

---

## 3. User journeys / user-onboarding

**Aligned**

- **E2E coverage**: `tests/e2e/journeys/` — guided-sports, signup-to-first-value, join-trip, create-trip; unauthenticated redirects and setup steps covered.
- **Onboarding**: `app/(auth)/onboarding/page.tsx` — quick setup (display name, optional home city), redirect to trip after join when `inviteCode` in query.
- **First-30-seconds**: WelcomeModal in root layout; onboarding uses clear copy (“Add your name so your group recognizes you”) and optional home city with tooltip.

**Improvements**

- Add a journey spec (or E2E test) for “first trip created → first value (e.g. availability or vote)” to lock the activation path.
- Consider one explicit “next step” CTA on dashboard when the user has not yet added availability or voted (already partially present via NextStepsCard).

---

## 4. shadcn-ui / components/ui

**Aligned**

- **Primitives**: Button (variants, loading, aria-busy), Input (label, hint, error, id association), Card, Stepper, Skeleton, EmptyState, Tooltip, Dialog, StickyFooter, sonner Toaster. Used consistently across app and trip pages.
- **Forms**: Onboarding and sign-in use controlled inputs and clear error display; `role="alert"` for errors on onboarding.

**Improvements**

- **Complex forms**: For multi-field forms (e.g. create trip, plan items, logistics), consider adopting the shadcn Form + react-hook-form + Zod pattern from the skill for validation and accessibility (single source of truth, field-level errors).
- **Tooltip trigger**: The “?” trigger in onboarding uses a `<span>`; ensure it’s keyboard-focusable and has appropriate aria (e.g. `aria-describedby` when tooltip is shown) for accessibility-compliance.

---

## 5. tailwind-v4-shadcn

**Aligned**

- **Tailwind v4**: `@import "tailwindcss"` and `@theme { ... }` in `app/globals.css`; design tokens (primary, secondary, CTA, background, brand scale, dark surface/ink/muted).
- **Theme**: Dark mode via class and `ws_theme` in localStorage; theme script in root layout.
- **No v3 config**: No `tailwind.config.ts` in use.

**Improvements**

- Keep any new tokens (e.g. spacing, radii) in `@theme` for consistency and to avoid drift from the tailwind-v4-shadcn skill.

---

## 6. Accessibility (accessibility-compliance / web-design-guidelines)

**Aligned**

- **Button**: Focus ring, `aria-busy` when loading, disabled state.
- **Input**: Label associated via `htmlFor`/`id`, error and hint text; error state styling.
- **Tests**: `tests/e2e/a11y.spec.ts` runs axe on landing and sign-in.
- **Error UI**: Error boundaries use headings and readable copy; trip error offers “Try again” and “Back to Dashboard”.

**Improvements**

- Add a11y smoke tests for onboarding and at least one trip page (e.g. dashboard) so critical paths are covered.
- Tooltip “?” triggers: make focusable (button or link) and ensure tooltip is announced (e.g. `aria-describedby` when open).
- Ensure all interactive elements in TripNavigation and AppFooterNav have visible focus and sensible tab order.

---

## 7. UX writing (ux-writing)

**Aligned**

- **Centralized errors**: `lib/uxErrors.ts` — friendly messages for join (invalid code, rate limit) and create (onboarding required).
- **Onboarding**: Short headings and hints; “Quick setup”, “Your name”, “Home city (optional)”, “How your group will see you.”
- **Error boundaries**: “Something went wrong!”, “Try again”, “Go Home”; trip error explains possible causes and offers “Need help? Visit our support center.”

**Improvements**

- Audit API-originated error messages shown in UI (e.g. profile save, trip create) so they’re either from `uxErrors` or follow the same tone (concise, actionable, no raw technical strings).
- Empty states: ensure every list (events, plan items, members, etc.) has a short, actionable empty message (EmptyState is used; copy can be reviewed for consistency).

---

## 8. Playwright / e2e-testing-patterns

**Aligned**

- **Structure**: `tests/e2e/` with smoke, a11y, and `journeys/` (guided-sports, join-trip, create-trip, signup-to-first-value); shared `utils/ux-validators.ts`.
- **Config**: `playwright.config.ts` — baseURL, timeouts, webServer, trace on failure.
- **Guided flow**: Redirects for unauthenticated setup routes and basic “city input and continue” check.

**Improvements**

- Add explicit waits or assertions for “continue”/navigation after form submit where flakiness is possible (e.g. wait for URL or visible next-step content) per e2e-testing-patterns.
- Consider tagging critical-path tests (e.g. `@critical`) and running them in CI with `test:journeys:critical` for fast feedback.

---

## 9. Vitest

**Aligned**

- **Unit tests**: `lib/validation/*.test.ts`, `lib/skills/**/*.test.ts`, `lib/events/**/*.test.ts`, `lib/rankedChoice.test.ts` — validation and business logic covered.
- **Scripts**: `test` and `test:watch` in package.json.

**Improvements**

- Add unit tests for any new lib modules (e.g. `lib/uxErrors.ts`, small helpers in `lib/utils.ts`) when touched.
- Keep validation schemas (Zod) co-located with tests so API and client validation stay in sync.

---

## 10. Systematic-debugging / verification-before-completion

**Process (no code change)**

- Before claiming a fix: run the relevant test or repro step and confirm output (verification-before-completion).
- For bugs: identify root cause (logs, state, RLS, API response) before changing code (systematic-debugging).

---

## 11. writing-plans

**Process (no code change)**

- For multi-step features: write a short implementation plan (files, order, tests) before coding; keep steps small (e.g. one logical change per step).

---

## 12. frontend-design / ui-ux-pro-max

**Aligned**

- **Identity**: Distinct typography (Outfit, Work Sans), brand palette (primary rose, CTA blue, poster accents), noise background, dark/light themes.
- **Layout**: Constrained width (max-w-md / max-w-3xl), cards, sticky footer where needed.

**Improvements**

- When adding new pages or flows, keep one clear “hero” or primary action per screen and reuse the same component set (Button, Card, Input, EmptyState) for consistency.

---

## Summary

| Area              | Status   | Priority improvements                                      |
|-------------------|----------|------------------------------------------------------------|
| Next.js/App Router| Strong   | Add loading.tsx for plan, events, voting, availability    |
| Supabase/Postgres | Strong   | Document RLS/trip-scoping; verify all mutations protected  |
| User journeys     | Good     | E2E for “first value”; clarify next-step CTAs              |
| shadcn-ui         | Good     | Form + RHF + Zod for complex forms; tooltip a11y           |
| Tailwind v4       | Strong   | Keep tokens in @theme                                      |
| Accessibility     | Good     | A11y tests for onboarding + trip; focusable tooltips       |
| UX writing        | Good     | Centralize API error copy; review empty states             |
| E2E               | Good     | Stabilize waits; consider @critical CI                     |
| Vitest            | Strong   | Test new lib code; keep validation tests                   |
| Process           | N/A      | Use verification-before-completion and writing-plans        |

Use this audit when planning refactors or new features so the codebase stays aligned with AGENTS.md skills.
