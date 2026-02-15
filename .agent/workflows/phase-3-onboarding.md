---
description: Phase 3 - Enhance onboarding experience for new users
---

# Phase 3: Onboarding Enhancements

**Priority:** P1  
**Status:** ⏳ Not Started

## Objective

Improve first-time user experience with welcome flows and contextual hints.

## Tasks

### 1. Welcome Modal

Create welcome experience for new users:
- Show on first login (check user metadata)
- Explain app's value proposition
- Guide through key features
- Dismissible with "Don't show again" option

### 2. Enhanced Onboarding Page

File: `app/(auth)/onboarding/page.tsx`
- Add Tooltip components for field explanations
- Enhance "Why we ask" messaging
- Add visual progress if multi-step

### 3. First Trip Creation Flow

File: `app/trips/new/create-trip-client.tsx`
- Add Tooltip for each field (trip type, dates, planning window)
- Include contextual hints
- Show example trip codes

### 4. Contextual Hints

Add dismissible hints to key pages:
- Trip dashboard: "Invite friends to get started"
- Availability: "Mark your available weekends"
- Voting: "Rank your preferences"
- Plan: "Add activities to your itinerary"

## Implementation Steps

1. Create welcome modal component (use Modal foundation)
2. Add user preference tracking (localStorage or DB)
3. Enhance onboarding page with Tooltip components
4. Add contextual hints to key flows
5. Ensure all hints are dismissible
6. Test new user journey end-to-end

## Verification

### User Journey Test
- Clear browser data to simulate new user
- Sign in with new email
- Verify welcome modal appears
- Complete onboarding flow
- Create first trip
- Verify contextual hints appear appropriately
- Capture screenshots of each step

### Build Check
// turbo
```bash
npm run build
```

## Completion Criteria

- [ ] Welcome modal implemented
- [ ] Onboarding page enhanced with tooltips
- [ ] First trip creation has contextual help
- [ ] Hints dismissible and tracked
- [ ] New user journey tested
- [ ] Screenshots captured
- [ ] task.md updated
