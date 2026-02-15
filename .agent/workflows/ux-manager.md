---
description: Orchestrate all UX improvement phases with verification checkpoints
---

# UX Improvements Manager Agent

This agent manages the execution of all 10 UX improvement phases, ensuring quality through verification checkpoints before phase transitions.

## Overview

The manager coordinates phase agents and performs verification between phases to ensure:
- All phase objectives are met
- Components follow design system
- Accessibility requirements satisfied
- No regressions introduced

## Execution Flow

### 1. Check Current Phase Status

Read `task.md` to determine:
- Which phases are complete
- Current active phase
- Next phase to execute

### 2. Execute Next Phase

For each incomplete phase in priority order (P0 → P3):

**Phase 1:** Foundation Components
```bash
# Run: /.agent/workflows/phase-1-foundation.md
```

**Phase 2:** Empty States
```bash
# Run: /.agent/workflows/phase-2-empty-states.md
```

**Phase 3:** Onboarding Enhancements
```bash
# Run: /.agent/workflows/phase-3-onboarding.md
```

**Phase 4:** Progress Indicators
```bash
# Run: /.agent/workflows/phase-4-progress.md
```

**Phase 5:** Error Handling
```bash
# Run: /.agent/workflows/phase-5-errors.md
```

**Phase 6:** Contextual Help
```bash
# Run: /.agent/workflows/phase-6-help.md
```

**Phase 7:** What's Next Guidance
```bash
# Run: /.agent/workflows/phase-7-guidance.md
```

**Phase 8:** Navigation & Discoverability
```bash
# Run: /.agent/workflows/phase-8-navigation.md
```

**Phase 9:** Help & Documentation
```bash
# Run: /.agent/workflows/phase-9-docs.md
```

**Phase 10:** Feature Discovery & Feedback
```bash
# Run: /.agent/workflows/phase-10-discovery.md
```

### 3. Verify Phase Completion

After each phase agent completes:

#### A. Code Review
- Review all modified files
- Check for design system consistency
- Verify dark mode support
- Ensure no TypeScript errors

#### B. Build Verification
// turbo
```bash
npm run build
```

#### C. Accessibility Check
- Verify keyboard navigation
- Check ARIA attributes
- Test screen reader compatibility
- Validate focus management

#### D. Visual Verification
- Start dev server if not running
- Use browser subagent to verify:
  - Component rendering
  - Design system adherence (4px borders, brutalist aesthetic)
  - Responsive behavior
  - Dark mode
- Capture screenshots for walkthrough

#### E. Update Documentation
- Update `task.md` with completed items
- Update `walkthrough.md` with:
  - What was implemented
  - Screenshots of changes
  - Verification results

### 4. Gate to Next Phase

Only proceed to next phase if:
- ✅ All phase tasks marked complete in `task.md`
- ✅ Build passes without errors
- ✅ Visual verification confirms design system compliance
- ✅ Accessibility requirements met
- ✅ Walkthrough updated

If any check fails:
1. Document issues in walkthrough
2. Request user review via `notify_user`
3. Block progression until issues resolved

### 5. Progress Reporting

After each phase:
- Update user with summary of completed work
- Share walkthrough with screenshots
- Highlight any blockers or decisions needed

## Quality Gates

### Critical Issues (Block Phase Transition)
- TypeScript compilation errors
- Missing accessibility attributes
- Design system violations (wrong borders, colors, typography)
- Broken dark mode
- Failed builds

### Non-Critical Issues (Document but Don't Block)
- Minor styling inconsistencies
- Performance optimizations needed
- Nice-to-have enhancements

## Usage

To execute the full UX improvement plan:

1. User: "Run the UX improvements manager"
2. Agent reads this workflow
3. Agent executes phases sequentially with verification
4. Agent reports progress after each phase
5. Agent requests review at critical decision points
