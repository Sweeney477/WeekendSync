# Journey: [Name]

## Overview
| Attribute | Value |
|-----------|-------|
| **Priority** | Critical / High / Medium |
| **User Type** | New / Returning / Admin |
| **Frequency** | Daily / Weekly / One-time |
| **Success Metric** | Conversion rate, time to complete, drop-off rate |

## User Goal
What is the user trying to accomplish? Write from their perspective.

> "I want to [goal] so that I can [benefit]."

## Preconditions
- User state (logged in, has subscription, first visit)
- Data state (has items in cart, has team members)
- Environment (mobile, desktop, slow connection)

## Journey Steps

### Step 1: [Entry Point]
**User Action:** What the user does
**System Response:** What they should see/experience
**Success Criteria:**
- [ ] Page loads in < 2 seconds
- [ ] Primary CTA is immediately visible
- [ ] User understands what to do next

**Potential Friction:**
- Slow load time → Show skeleton/loader
- Unclear CTA → A/B test copy variations

---

### Step 2: [Next Action]
**User Action:** ...
**System Response:** ...
**Success Criteria:**
- [ ] ...

**Potential Friction:**
- ...

---

## Error Scenarios

### E1: [Error Name]
**Trigger:** What causes this error
**User Sees:** Error message/state
**Recovery Path:** How user gets back on track
**Test:** How to verify recovery works

## Metrics to Track
- Time to complete journey
- Drop-off rate at each step
- Error rate and recovery rate
- User satisfaction (if surveyed)

## E2E Test Reference
Link to Playwright test: `tests/e2e/journeys/[name].spec.ts`
