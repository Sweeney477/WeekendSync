# Prioritized Improvements

Quick reference for the improvement backlog. Full context and “Aligned / Improvements” detail are in [AGENTS_SKILLS_AUDIT.md](AGENTS_SKILLS_AUDIT.md).

## Priority framework

| Tier | Criteria | When to do |
|------|----------|------------|
| **P0** | Security, data integrity, correctness | Before or in next sprint |
| **P1** | Reliability, regression prevention, compliance | Next 1–2 sprints |
| **P2** | Perceived performance and UX polish | As capacity allows |
| **P3** | Activation and journey clarity | When focusing on growth/onboarding |
| **P4** | Documentation and ongoing habits | Continuous / when touching code |

## P0 — Security and correctness

| # | Improvement | Status |
|---|-------------|--------|
| 1 | Verify every API route that mutates trip-scoped data uses `assertTripMember` (or equivalent) | Done: votes, results, destinations, calendar.ics updated; others already had checks |
| 2 | Document RLS and trip-scoping | Done: [docs/RLS_AND_TRIP_SCOPING.md](RLS_AND_TRIP_SCOPING.md) |

## P1 — Reliability and compliance

| # | Improvement | Status |
|---|-------------|--------|
| 3 | E2E: explicit waits and navigation assertions | Done: journey specs assert URL + visible heading after redirects |
| 4 | E2E: tag critical paths and CI | Done: `@critical` on guided-sports; `test:journeys:critical` in package.json |
| 5 | A11y: extend smoke coverage | Done: onboarding and trip dashboard entry in tests/e2e/a11y.spec.ts |
| 6 | A11y: focusable tooltips | Done: Tooltip has id/aria-describedby; all “?” triggers are `<button>` with aria-label |

## P2 — UX polish and perceived performance

| # | Improvement | Status |
|---|-------------|--------|
| 7 | Loading states for heavy routes | Done: loading.tsx for plan, events, voting, availability, weekends, summary |
| 8 | UX writing: centralize API error copy | Done: getFriendlyProfileError, getFriendlyGenericError; onboarding + profile use profile helper |
| 9 | UX writing: empty states | Done: reviewed; home “No Trips Yet” description tightened |

## P3 — Activation and journey clarity

| # | Improvement | Status |
|---|-------------|--------|
| 10 | E2E: “first value” journey | Done: tests/e2e/journeys/first-value.spec.ts (skipped until auth fixture) |
| 11 | Dashboard next-step CTA | Done: NextStepsCard reviewed; comment added for activation priority |
| 12 | Complex forms (optional) | Deferred: consider Form + react-hook-form + Zod when forms are a pain point |

## P4 — Ongoing maintenance

| # | Improvement | Action |
|---|-------------|--------|
| 13 | Vitest | When adding/changing lib code, add or update unit tests |
| 14 | Tailwind v4 | Put new design tokens in `@theme` in app/globals.css |
| 15 | Frontend design | One clear primary action per screen; reuse Button, Card, Input, EmptyState |
| 16 | Process | Use verification-before-completion and writing-plans |

## Execution order

- **Immediate:** P0 (done).
- **Next:** P1 (done).
- **Then:** P2 (done); pick further polish as needed.
- **When focusing on activation:** P3 (done except optional complex forms).
- **Always:** P4 as part of normal development.
