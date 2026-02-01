# Journey: Signup to First Value

## Overview
| Attribute | Value |
|-----------|-------|
| **Priority** | Critical |
| **User Type** | New |
| **Frequency** | One-time |
| **Success Metric** | % reaching trip (create or join) within 5 min |

## User Goal
> "I want to try WeekendSync quickly so I can see if it helps my group pick a weekend that works."

## Preconditions
- First visit or no account
- May have invite link from a friend or came from landing
- Mobile or desktop

## Journey Steps

### Step 1: Home / Join entry
**User Action:** Lands on `/` or `/join/[code]`; enters trip code or clicks "Create New Trip"
**System Response:** Clear "Join Trip" and "Create New Trip" paths; trip code input visible
**Success Criteria:**
- [ ] Primary actions visible above fold
- [ ] Trip code accepts 8–12 chars, uppercase
- [ ] Guest can proceed to sign-in with context preserved (inviteCode, next)

**Potential Friction:**
- Unclear what "trip code" is → Use helper: "Enter the code your friend shared"
- No account → Redirect to sign-in then back to join/onboarding with inviteCode

### Step 2: Sign in (magic link)
**User Action:** Enters email; clicks "Send sign-in link"
**System Response:** "Check your email for the sign-in link"; no password
**Success Criteria:**
- [ ] One field (email); send in < 3 s
- [ ] Redirect after click preserves inviteCode/next (cookie or URL)
- [ ] Copy: "We'll email you a one-time code link. No password."

**Potential Friction:**
- Email typo → Inline validation before send
- Link expired → Clear message + "Send new link"

### Step 3: Onboarding (quick setup)
**User Action:** After first sign-in, lands on `/onboarding`; enters name (required), home city (optional); clicks "Continue"
**System Response:** Profile saved; redirect to trip plan (if inviteCode) or home
**Success Criteria:**
- [ ] Max 2 fields; name required
- [ ] Skip not needed (only 2 fields); < 60 s to complete
- [ ] If inviteCode in URL, join trip after save and go to trip plan

**Potential Friction:**
- "Complete onboarding first" (409) → Message: "Add your name so your group recognizes you"
- Too many questions → Keep only name + optional home city

### Step 4: First value (trip plan or dashboard)
**User Action:** Lands on trip plan or dashboard; sees next step (e.g. Mark availability, Pick a weekend)
**System Response:** Trip context clear; one clear "Continue" or "Mark Your Availability"
**Success Criteria:**
- [ ] User is in a trip (created or joined)
- [ ] Next step obvious
- [ ] Invite/share available for organizers

## Error Scenarios

### E1: Invalid or expired invite code
**Trigger:** Join with wrong/expired code
**User Sees:** "That invite code isn't valid. Check the link or ask your friend for a new one."
**Recovery Path:** Stay on home; can try another code or create trip
**Test:** `tests/e2e/journeys/join-invalid-code.spec.ts`

### E2: Already have account (email in use)
**Trigger:** Magic link for existing user
**User Sees:** Normal sign-in flow; no separate "already have account" block
**Recovery Path:** Click link → signed in → continue
**Test:** Covered by sign-in flow

### E3: Complete onboarding first (409)
**Trigger:** Create trip or join before profile has display_name
**User Sees:** Redirect to onboarding with next/inviteCode preserved
**Recovery Path:** Complete onboarding → automatic redirect to trip
**Test:** `tests/e2e/journeys/onboarding-required.spec.ts`

## Metrics to Track
- Sign-in → onboarding complete: target < 2 min
- Onboarding → trip plan: target < 1 min
- Drop-off at sign-in, onboarding, join
- Join error rate (invalid code, rate limit)

## E2E Test Reference
`tests/e2e/journeys/signup-to-first-value.spec.ts` (to add)
