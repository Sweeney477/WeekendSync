# Journey: Create Trip

## Overview
| Attribute | Value |
|-----------|-------|
| **Priority** | Critical |
| **User Type** | New or returning (organizer) |
| **Frequency** | One-time per trip |
| **Success Metric** | Trip created; user on dashboard/plan with shareable link in < 2 min |

## User Goal
> "I want to create a trip and get a link to share so my friends can join and we can find a weekend that works."

## Preconditions
- Signed in; onboarding complete (display_name set)
- On home or `/trips/new`
- Mobile or desktop

## Journey Steps

### Step 1: Start create
**User Action:** Clicks "Create New Trip" on home or goes to `/trips/new`
**System Response:** Create form: Trip name, First date, Trip type, Planning window (weeks)
**Success Criteria:**
- [ ] Form loads; trip name and first date required
- [ ] Defaults sensible (e.g. weekend, 12 weeks)
- [ ] "Create Trip" CTA visible

**Potential Friction:**
- Not onboarded → 409 "Complete onboarding first" → Redirect to onboarding with next=/trips/new

### Step 2: Submit create
**User Action:** Fills name + date (and optional type/window); clicks "Create Trip"
**System Response:** POST /api/trips; create_trip RPC runs; returns trip + invite_code
**Success Criteria:**
- [ ] Creating… state; no double submit
- [ ] Success: redirect to trip dashboard (or plan)
- [ ] Invite link available (dashboard or post-create modal)

### Step 3: Share invite
**User Action:** Copies or shares invite link (e.g. from dashboard "Invite More Friends" or post-create modal)
**System Response:** Copy to clipboard or native share; feedback "Link copied" or share sheet
**Success Criteria:**
- [ ] Link format: origin/join/[invite_code]
- [ ] Copy/share works; clear success feedback
- [ ] Modal (if used) has "Go to Trip Plan" / "Continue"

### Step 4: Next step in trip
**User Action:** Goes to trip plan or dashboard; sees "Mark Your Availability" or "Invite More Friends"
**System Response:** Dashboard shows group status, next step CTA
**Success Criteria:**
- [ ] Organizer sees invite option and progress
- [ ] Clear next action

## Error Scenarios

### E1: Onboarding not complete (409)
**Trigger:** Create trip before profile has display_name
**User Sees:** Redirect to onboarding; message "Add your name so your group recognizes you"
**Recovery Path:** Complete onboarding → redirect to /trips/new or trip
**Test:** Create trip before onboarding; assert redirect and then success after onboarding

### E2: Invalid input (400)
**Trigger:** Missing name, invalid date, or invalid planning window
**User Sees:** "Please add a trip name and first date." / field-level messages
**Recovery Path:** Fix form; resubmit
**Test:** Submit empty or invalid; assert inline/block message

### E3: Server/network failure
**Trigger:** API error or timeout
**User Sees:** "We couldn't create the trip. Check your connection and try again."
**Recovery Path:** Retry; form data preserved if possible
**Test:** Mock 500; assert message and retry

## Metrics to Track
- Create trip success rate
- Time from "Create Trip" click to dashboard
- Share (copy/share) usage after create

## E2E Test Reference
`tests/e2e/journeys/create-trip.spec.ts` (to add)
