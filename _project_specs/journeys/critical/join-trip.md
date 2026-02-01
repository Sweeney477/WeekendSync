# Journey: Join Trip by Invite

## Overview
| Attribute | Value |
|-----------|-------|
| **Priority** | Critical |
| **User Type** | New or returning (with invite) |
| **Frequency** | One-time per trip |
| **Success Metric** | Join completion rate; time to trip plan < 2 min |

## User Goal
> "I want to join my friend's trip using the link they sent so we can pick dates together."

## Preconditions
- Has invite link `/join/[code]` or trip code (8–12 chars)
- May be signed out or need onboarding
- Mobile or desktop

## Journey Steps

### Step 1: Entry (link or home)
**User Action:** Opens `/join/ABC12XYZ` or enters code on home "Trip Code" input
**System Response:** If link: show "Join trip" with code; if home: show code input + "Join Trip"
**Success Criteria:**
- [ ] Code visible or easy to enter
- [ ] Signed-in + onboarded: auto attempt join or one click
- [ ] Not signed in: "Sign in to join" or redirect to sign-in with inviteCode

**Potential Friction:**
- Wrong code format → Validate 8–12 A–Z, 0–9; message: "Code is 8–12 letters and numbers"

### Step 2: Auth (if needed)
**User Action:** Signs in via magic link (inviteCode in URL or cookie)
**System Response:** Callback preserves inviteCode; redirect to onboarding (if no profile) or join
**Success Criteria:**
- [ ] After sign-in, user lands on onboarding (if needed) or join request
- [ ] No loss of invite context

### Step 3: Join request
**User Action:** (Auto or) clicks join; API calls `join_trip_by_invite`
**System Response:** Success → redirect to `/trip/[id]/plan`
**Success Criteria:**
- [ ] Join in < 3 s
- [ ] Clear loading: "Joining trip..."
- [ ] On success: go straight to plan

### Step 4: Trip plan
**User Action:** Sees trip plan/dashboard; "Mark Your Availability" or next step
**System Response:** Trip context; next step CTA
**Success Criteria:**
- [ ] User is member; can submit availability
- [ ] Invite code no longer needed for this trip

## Error Scenarios

### E1: Invalid invite code
**Trigger:** Code wrong, expired, or typo
**User Sees:** "That invite code isn't valid. Check the link or ask your friend for a new one."
**Recovery Path:** Try again with correct code or "Go to Home" to enter code / create trip
**Test:** Join with invalid code; assert message and home link

### E2: Rate limit
**Trigger:** Too many join attempts
**User Sees:** "Too many attempts. Please wait a minute and try again."
**Recovery Path:** Wait; retry
**Test:** `tests/e2e/journeys/join-rate-limit.spec.ts` (optional)

### E3: Already a member
**Trigger:** User already in trip; join again
**System Response:** Idempotent; redirect to trip plan (on conflict do nothing)
**User Sees:** No error; lands on trip
**Test:** Join same trip twice; second time still lands on plan

## Metrics to Track
- Join success rate
- Join errors (invalid_code vs rate_limit)
- Time from link open to trip plan

## E2E Test Reference
`tests/e2e/journeys/join-trip.spec.ts` (to add)
