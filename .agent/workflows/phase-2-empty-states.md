---
description: Phase 2 - Add empty states across the application
---

# Phase 2: Empty States

**Priority:** P1  
**Status:** 🔄 In Progress

## Objective

Implement EmptyState component across key pages to guide users when no data is present.

## Tasks

### 1. Homepage Empty State ✅

File: `app/(public)/home-client.tsx`
- Show when authenticated user has no trips
- Icon: Calendar
- Title: "No Trips Yet"
- CTA: "Create Your First Trip" + "Learn How It Works"

### 2. Events Page Enhancement ✅

File: `app/dashboard/events/page.tsx`
- Enhanced description
- Contextual help tips
- Better search guidance

### 3. Trip Dashboard Empty State

File: `app/trip/[tripId]/dashboard/page.tsx`
- Show when trip has no members
- Guide organizer to invite members
- Share invite code prominently

### 4. Plan Page Empty State

File: `app/trip/[tripId]/plan/plan-client.tsx`
- Show when no itinerary items
- Guide to add first activity
- Suggest browsing events

### 5. Costs Page Empty State

File: `app/trip/[tripId]/costs/page.tsx` (if exists)
- Show when no expenses tracked
- Guide to add first expense
- Explain cost splitting feature

## Implementation Steps

1. Review each page's current empty/loading states
2. Identify where EmptyState component should be used
3. Design appropriate icons, titles, descriptions
4. Implement with proper conditionals
5. Test with zero-data scenarios
6. Verify dark mode

## Verification

### Visual Testing
// turbo
```bash
npm run dev
```

For each empty state:
- Navigate to page with no data
- Verify EmptyState renders correctly
- Check brutalist design consistency
- Test dark mode
- Verify CTAs work
- Capture screenshots

### Build Check
// turbo
```bash
npm run build
```

## Completion Criteria

- [ ] All 5 empty states implemented
- [ ] Each empty state has appropriate icon and messaging
- [ ] All CTAs functional
- [ ] Dark mode working
- [ ] Screenshots captured
- [ ] task.md updated
