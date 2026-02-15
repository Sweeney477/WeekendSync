---
description: Phase 7 - Guide users on what to do next after actions
---

# Phase 7: "What's Next" Guidance

**Priority:** P2  
**Status:** ⏳ Not Started

## Objective

Improve post-action guidance so users always know their next step.

## Tasks

### 1. Success State Enhancements

After major actions, show clear "what's next":

**Trip Created:**
- ✅ Success toast
- Modal: "Trip created! Next: Invite your friends"
- Show invite code prominently
- Button: "Copy Invite Link"

**Trip Joined:**
- ✅ Success toast
- Redirect to trip dashboard
- Highlight: "Mark your availability to help the group decide"

**Availability Submitted:**
- ✅ Success message
- Show: "X/Y members have submitted availability"
- Next step: "Waiting for [names] to submit"
- Or: "Ready to vote on weekends!"

**Votes Cast:**
- ✅ Success message
- Show current standings
- Next: "Waiting for final votes" or "Results are in!"

**Itinerary Item Added:**
- ✅ Success toast
- Suggest: "Add another activity" or "Invite friends to see the plan"

### 2. Dashboard "Next Step" Widget

File: `app/trip/[tripId]/dashboard/page.tsx`
- Create prominent "What's Next" card
- Dynamically show based on trip state:
  - "Invite members" (if solo)
  - "Submit availability" (if pending)
  - "Vote on dates" (if availability complete)
  - "Plan activities" (if dates locked)
  - "Track expenses" (if trip active)

### 3. Empty State CTAs

Ensure all EmptyState components have clear CTAs:
- Primary action: main next step
- Secondary action: learn more or alternative path

### 4. Progress Celebration

Add small celebrations for milestones:
- First member joins
- All availability submitted
- Dates locked in
- Trip fully planned

## Implementation Steps

1. Map user journey and identify action completion points
2. Design success states with next-step guidance
3. Implement "What's Next" dashboard widget
4. Add celebration moments (toasts, confetti effects?)
5. Test full user flow from creation to completion
6. Verify guidance is always clear

## Verification

### User Flow Testing

Complete full trip lifecycle:
1. Create trip → verify next step shown
2. Invite members → verify guidance
3. Submit availability → verify progress indication
4. Vote → verify standings and next step
5. Plan activities → verify suggestions
6. Track costs → verify final state

Capture screenshots at each stage.

### Build Check
// turbo
```bash
npm run build
```

## Completion Criteria

- [ ] All success states enhanced
- [ ] "What's Next" widget implemented
- [ ] Progress celebrations added
- [ ] User flow tested end-to-end
- [ ] Screenshots captured
- [ ] task.md updated
