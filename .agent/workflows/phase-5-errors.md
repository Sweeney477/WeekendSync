---
description: Phase 5 - Improve error messages to be actionable
---

# Phase 5: Error Handling

**Priority:** P2  
**Status:** ⏳ Not Started

## Objective

Enhance error messages throughout the app to be more helpful and actionable.

## Tasks

### 1. Review Existing Error Handling

Audit all error scenarios:
- Authentication failures
- API errors
- Validation errors
- Network failures
- Permission errors

### 2. Create Error Message Components

Enhance existing or create new:
- Use toast notifications (sonner) for transient errors
- Use Modal for critical errors requiring action
- Add inline validation messages with helpful hints

### 3. Improve Specific Error Flows

**Authentication Errors:**
- Clear messaging for expired sessions
- Guide to re-authenticate
- Explain rate limiting (Supabase OTP)

**API Errors:**
- Replace generic "Error occurred" with specific messages
- Include recovery actions
- Show support contact for critical failures

**Validation Errors:**
- Real-time feedback on forms
- Explain why input is invalid
- Suggest corrections

**Network Errors:**
- Detect offline state
- Show retry button
- Cache data when possible

### 4. Error Boundary Enhancement

File: Create `components/ErrorBoundary.tsx` if needed
- Catch React errors gracefully
- Show friendly error page
- Include "Report Bug" option
- Log errors for debugging

## Implementation Steps

1. Search codebase for error handling patterns
2. Identify low-quality error messages
3. Create reusable error message templates
4. Replace generic errors with helpful ones
5. Add recovery actions to all errors
6. Test error scenarios comprehensively

## Verification

### Error Scenario Testing

Test each error type:
- Trigger authentication error (expired token)
- Simulate API failure (disconnect network)
- Submit invalid form data
- Test permission denied scenarios
- Capture screenshots of error states

### Build Check
// turbo
```bash
npm run build
```

## Completion Criteria

- [ ] All error messages reviewed and improved
- [ ] Error boundaries implemented
- [ ] Recovery actions provided for all errors
- [ ] Validation errors helpful
- [ ] Error screenshots captured
- [ ] task.md updated
