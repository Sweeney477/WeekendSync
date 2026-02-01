# Journey E2E tests

These specs mirror the critical journey docs so the documented flows are executable.

| Spec | Journey doc | Steps covered |
|------|-------------|---------------|
| [signup-to-first-value.spec.ts](signup-to-first-value.spec.ts) | [_project_specs/journeys/critical/signup-to-first-value.md](../../_project_specs/journeys/critical/signup-to-first-value.md) | 1: Landing CTAs; 2: Sign-in form; 3: Unauthenticated /onboarding redirects to sign-in |
| [join-trip.spec.ts](join-trip.spec.ts) | [_project_specs/journeys/critical/join-trip.md](../../_project_specs/journeys/critical/join-trip.md) | 1: /join/[code] entry, Sign in to join; Home join redirects to sign-in with inviteCode |
| [create-trip.spec.ts](create-trip.spec.ts) | [_project_specs/journeys/critical/create-trip.md](../../_project_specs/journeys/critical/create-trip.md) | Unauthenticated /trips/new redirects to sign-in |

Onboarding form and create-trip form tests require auth (test user); add with `@auth` tag when fixture is available.

Run all journey tests:

```bash
npm run test:journeys
```
