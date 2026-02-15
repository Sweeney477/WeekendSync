---
description: Phase 4 - Add progress indicators for multi-step flows
---

# Phase 4: Progress Indicators

**Priority:** P1  
**Status:** ⏳ Not Started

## Objective

Add visual progress tracking for multi-step flows using the enhanced Stepper component.

## Tasks

### 1. Trip Setup Flow

File: `app/trip/[tripId]/setup/*`
- Audit all setup steps
- Add Stepper component showing: Basic Info → Availability → Voting → Planning → Summary
- Mark completed steps with checkmarks
- Allow navigation to past steps

### 2. Voting Flow Progress

File: `app/trip/[tripId]/voting/*`
- Show progress: Weekends → Destinations → Review
- Indicate which voting is complete
- Show when ready to lock in choices

### 3. Planning Flow Progress

File: `app/trip/[tripId]/plan/*`
- Show stages: Itinerary → Events → Costs → Finalize
- Track completion percentage
- Highlight next recommended action

### 4. Profile Completion Indicator

File: `app/profile/*` (if exists)
- Show profile completeness (e.g., "60% complete")
- Guide user to fill missing info
- Optional: Add avatar, preferences, etc.

## Implementation Steps

1. Map out all multi-step flows in the app
2. Define steps for each flow
3. Implement Stepper component on each page
4. Add completion tracking logic
5. Test navigation between steps
6. Verify visual consistency

## Verification

### Flow Testing

For each multi-step flow:
- Start from beginning
- Verify Stepper displays correctly
- Complete each step
- Check completion indicators update
- Test backward navigation
- Capture screenshots

### Build Check
// turbo
```bash
npm run build
```

## Completion Criteria

- [ ] Trip setup has progress indicator
- [ ] Voting flow shows progress
- [ ] Planning flow tracked
- [ ] All steppers use consistent design
- [ ] Completion states accurate
- [ ] Screenshots captured
- [ ] task.md updated
