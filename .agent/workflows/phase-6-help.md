---
description: Phase 6 - Add contextual help throughout the app
---

# Phase 6: Contextual Help

**Priority:** P2  
**Status:** ⏳ Not Started

## Objective

Add tooltips and inline guidance to help users understand features without leaving the page.

## Tasks

### 1. Add Tooltips to Key Features

Use Tooltip component on:
- **Trip Type** - Explain differences between weekend, week-long, etc.
- **Planning Window** - What this deadline means
- **Ranked-Choice Voting** - How the voting system works
- **Cost Splitting** - How expenses are divided
- **Invite Code** - How to share and where friends enter it

### 2. Create Help Icons

Add (?) icon next to complex features:
- Small, unobtrusive "info" icon
- Opens Tooltip on hover/click
- Consistent placement (right side of labels)

### 3. Inline Explanations

Add brief explanatory text under inputs:
- Availability: "Mark weekends you're free"
- Voting: "Rank from most to least preferred"
- Budget: "Estimated cost per person"

### 4. Feature Introduction Popovers

For new/complex features:
- First-time user sees brief explanation
- Dismissible with "Got it" button
- Track dismissal in localStorage

## Implementation Steps

1. Identify features needing help text
2. Write concise, helpful explanations (2-3 sentences max)
3. Add Tooltip components to labels/headers
4. Create consistent help icon design
5. Test on mobile (ensure Tooltips work on touch)
6. Verify doesn't clutter UI

## Verification

### Help Coverage Audit

Review each page:
- [ ] Homepage - features explained
- [ ] Trip creation - all fields have help
- [ ] Availability - instructions clear
- [ ] Voting - ranked-choice explained
- [ ] Planning - itinerary guidance
- [ ] Costs - splitting explained
- [ ] Events search - tips provided

### Usability Test
- Navigate app as new user
- Verify help available when confused
- Check mobile tooltip behavior
- Capture screenshots

### Build Check
// turbo
```bash
npm run build
```

## Completion Criteria

- [ ] Tooltips added to all complex features
- [ ] Help icons consistent across app
- [ ] Inline explanations helpful
- [ ] Mobile-friendly
- [ ] Screenshots captured
- [ ] task.md updated
