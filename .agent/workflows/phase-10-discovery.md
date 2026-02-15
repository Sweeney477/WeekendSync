---
description: Phase 10 - Add feature discovery and feedback mechanisms
---

# Phase 10: Feature Discovery & Feedback

**Priority:** P3  
**Status:** ⏳ Not Started

## Objective

Help users discover new features and provide feedback to improve the product.

## Tasks

### 1. Feature Announcement System

Create: `components/FeatureAnnouncement.tsx`
- Show new feature announcements
- Dismissible with "Got it" or "Learn more"
- Track which announcements user has seen
- Store in localStorage or user preferences

Example announcements:
- "New: Browse events from Ticketmaster!"
- "Try ranked-choice voting for fair decisions"
- "Pro tip: Share your invite code to invite multiple friends"

### 2. Tips & Tricks

Add rotating tips on dashboard:
- Carousel of helpful tips
- "Did you know?" section
- Tips relevant to current trip state

### 3. Feedback Widget

Create: `components/FeedbackWidget.tsx`
- Floating feedback button
- Modal with feedback form:
  - Feature request
  - Bug report
  - General feedback
- Submit to email or feedback service
- Thank you message after submission

### 4. Feature Hints (First-Time Use)

For complex features, show one-time hints:
- Ranked-choice voting: explain on first vote
- Event search: show tips on first search
- Cost splitting: explain on first expense

Track in localStorage which hints shown.

### 5. "What's New" Page

Create: `app/whats-new/page.tsx`
- Changelog of recent updates
- List of new features
- Link from footer
- Show badge if unread updates

## Implementation Steps

1. Design announcement/tip UI components
2. Create feedback form and submission logic
3. Implement feature hint system
4. Build "What's New" page
5. Add tracking for user interactions
6. Test announcement timing and relevance

## Verification

### Feature Discovery Testing

- [ ] Announcements display correctly
- [ ] Tips rotate on dashboard
- [ ] Feedback form submits successfully
- [ ] First-time hints appear once
- [ ] "What's New" page accessible
- [ ] Capture screenshots

### User Experience Check
- Are announcements helpful or annoying?
- Do tips provide value?
- Is feedback easy to submit?
- Are hints dismissible?

### Build Check
// turbo
```bash
npm run build
```

## Completion Criteria

- [ ] Feature announcement system implemented
- [ ] Dashboard tips added
- [ ] Feedback widget created
- [ ] First-time hints working
- [ ] "What's New" page built
- [ ] All tracking functional
- [ ] Screenshots captured
- [ ] task.md updated
