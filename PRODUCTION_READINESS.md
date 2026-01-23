# Production Readiness Checklist

This document outlines the steps needed to make WeekendSync production-ready.

## A. Critical Fixes (Trip Load Issue)

### 1. Trip Plan Page Error Handling ✅ FIXED
- **Issue**: Page could crash if trip query failed or membership missing
- **Fix**: Added error handling in `app/trip/[tripId]/plan/page.tsx` to redirect gracefully when trip not found
- **Status**: ✅ Implemented

### 2. API Route Error Handling
- **Current State**: Most API routes have basic error handling but could be improved
- **Recommendations**:
  - Add consistent error response format across all routes
  - Log errors for monitoring (see Observability section)
  - Handle edge cases (e.g., trip deleted during request)

## B. Environment & Configuration

### 1. Environment Variables
- **Required**:
  - `NEXT_PUBLIC_SUPABASE_URL` - Must be set for production Supabase project
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe to expose)
  - `SUPABASE_SERVICE_ROLE_KEY` - Only for server-side admin operations (NEVER expose to browser)
  - `TICKETMASTER_API_KEY` - Optional, for event search features
- **Validation**: ✅ `lib/env.ts` validates required vars at runtime
- **Action Items**:
  - [ ] Create production `.env.local` or use platform environment variables
  - [ ] Verify all production env vars are set and correct
  - [ ] Document environment variable requirements in deployment guide

### 2. Supabase Configuration
- **Database Schema**: ✅ Complete in `db/schema.sql`
- **RLS Policies**: ✅ All tables have RLS enabled with proper policies
- **Functions**: ✅ `create_trip`, `join_trip_by_invite`, `recompute_weekend_scores`
- **Action Items**:
  - [ ] Verify production database has all migrations applied
  - [ ] Run `db/schema.sql` on production database (if not already done)
  - [ ] Test RLS policies in production to ensure proper access control
  - [ ] Verify database indexes exist for performance
  - [ ] Check `pgcrypto` extension is enabled

### 3. Auth Configuration
- **Auth Method**: Email OTP (magic links)
- **Redirect URLs**:
  - Site URL: `https://your-production-domain.com`
  - Redirect URLs: `https://your-production-domain.com/auth/callback`
- **Action Items**:
  - [ ] Configure production Supabase Auth redirect URLs
  - [ ] Test auth flow end-to-end in production
  - [ ] Verify onboarding flow works correctly

## C. Database & Security

### 1. Row Level Security (RLS)
- **Status**: ✅ All tables have RLS enabled
- **Policies**: ✅ Member-based access control implemented
- **Action Items**:
  - [ ] Audit RLS policies in production to ensure no data leaks
  - [ ] Test that non-members cannot access trip data
  - [ ] Verify organizer-only operations are properly protected

### 2. API Security
- **Current State**:
  - ✅ Server-side auth checks using `requireTripMember`
  - ✅ Input validation using Zod schemas
  - ⚠️ No rate limiting on public endpoints
- **Action Items**:
  - [ ] Add rate limiting for public endpoints (e.g., `/api/trips/join`)
  - [ ] Review API routes for potential SQL injection (use parameterized queries - already done via Supabase)
  - [ ] Add CSRF protection if needed (Next.js has built-in CSRF protection)
  - [ ] Consider adding request size limits

### 3. Secrets Management
- **Current State**: ✅ Service role key only used server-side
- **Action Items**:
  - [ ] Verify no secrets are exposed in client-side code
  - [ ] Use platform secrets management (Vercel, Railway, etc.) for production
  - [ ] Never commit `.env.local` to git (should be in `.gitignore`)

## D. Error Handling & Observability

### 1. Error Handling
- **Current State**: Basic error handling in most routes
- **Gaps**:
  - No centralized error logging
  - No error tracking service integration
  - Client errors only logged to console
- **Action Items**:
  - [ ] Add error logging service (e.g., Sentry, LogRocket, or simple file logging)
  - [ ] Implement consistent error response format:
    ```typescript
    { error: string, code?: string, details?: any }
    ```
  - [ ] Add error boundaries in React components
  - [ ] Improve client-side error messages for better UX

### 2. Logging & Monitoring
- **Current State**: Minimal logging (console.error in some places)
- **Action Items**:
  - [ ] Add structured logging for API routes
  - [ ] Log important events (trip creation, joins, errors)
  - [ ] Set up monitoring/alerting (e.g., Vercel Analytics, Supabase logs)
  - [ ] Track key metrics:
    - Trip creation rate
    - Error rates
    - API response times
    - Database query performance

### 3. Health Checks
- **Current State**: No health check endpoint
- **Action Items**:
  - [ ] Add `/api/health` endpoint that checks:
    - Database connectivity
    - Environment variables
    - External service availability (Ticketmaster if used)
  - [ ] Set up uptime monitoring

## E. Performance & Optimization

### 1. Build Configuration
- **Current State**: Next.js 15 with App Router
- **Action Items**:
  - [ ] Run `npm run build` and verify no build errors
  - [ ] Check bundle size and optimize if needed
  - [ ] Enable Next.js production optimizations
  - [ ] Test production build locally: `npm run build && npm start`

### 2. Database Performance
- **Indexes**: ✅ Key indexes exist on frequently queried columns
- **Action Items**:
  - [ ] Review query performance in production
  - [ ] Add indexes if needed for slow queries
  - [ ] Consider connection pooling (Supabase handles this, but verify settings)

### 3. Caching Strategy
- **Current State**: 
  - Client-side caching for offline support (LocalStorage)
  - No server-side caching configured
- **Action Items**:
  - [ ] Consider adding React Server Component caching where appropriate
  - [ ] Review caching strategy for API routes (currently `cache: "no-store"`)
  - [ ] Test offline functionality in production

## F. Testing

### 1. Test Coverage
- **Current State**: 
  - ✅ Unit tests: `lib/rankedChoice.test.ts`, `lib/skills/availability/scoreAvailability.test.ts`
  - ❌ No integration tests
  - ❌ No E2E tests
- **Action Items**:
  - [ ] Add tests for critical flows:
    - Trip creation
    - Trip joining
    - Plan item CRUD operations
    - Cost tracking
    - Voting system
  - [ ] Add integration tests for API routes
  - [ ] Consider E2E testing with Playwright or Cypress
  - [ ] Set up CI to run tests on every push

### 2. Manual Testing Checklist
- [ ] User can sign up and complete onboarding
- [ ] User can create a trip
- [ ] User can access trip plan page after creation
- [ ] User can join a trip via invite code
- [ ] Plan items can be created, updated, and deleted
- [ ] Costs can be added and split among members
- [ ] Voting works correctly
- [ ] Calendar export generates valid ICS files
- [ ] Offline mode works correctly
- [ ] Error handling displays user-friendly messages

## G. Deployment & Operations

### 1. Deployment Platform
- **Recommendations**: Vercel (Next.js optimized), Railway, or similar
- **Action Items**:
  - [ ] Set up production deployment pipeline
  - [ ] Configure build command: `npm run build`
  - [ ] Set start command: `npm start` (if needed)
  - [ ] Configure environment variables in deployment platform
  - [ ] Set up custom domain (if applicable)
  - [ ] Configure HTTPS (usually automatic)

### 2. Database Migrations
- **Current State**: SQL files in `db/` directory
- **Action Items**:
  - [ ] Document migration process
  - [ ] Create migration script or use Supabase migrations
  - [ ] Test migrations on staging before production
  - [ ] Create rollback plan for each migration

### 3. Backup & Recovery
- **Action Items**:
  - [ ] Configure Supabase automated backups
  - [ ] Test backup restoration process
  - [ ] Document recovery procedures
  - [ ] Set up database replication if needed

### 4. CI/CD
- **Current State**: No CI/CD pipeline configured
- **Action Items**:
  - [ ] Set up GitHub Actions or similar:
    - Run linter: `npm run lint`
    - Run tests: `npm test`
    - Build check: `npm run build`
  - [ ] Add pre-commit hooks for linting (optional but recommended)
  - [ ] Configure automatic deployments from main branch

## H. Documentation

### 1. Code Documentation
- **Current State**: Basic README exists
- **Action Items**:
  - [ ] Document API endpoints in README or separate API docs
  - [ ] Add code comments for complex logic
  - [ ] Document database schema relationships

### 2. User Documentation
- **Action Items**:
  - [ ] Create user guide/help documentation
  - [ ] Add FAQ section
  - [ ] Document known limitations

### 3. Developer Documentation
- **Action Items**:
  - [ ] Update README with production deployment steps
  - [ ] Document environment variable requirements
  - [ ] Create CONTRIBUTING.md if open source

## I. Legal & Compliance

### 1. Privacy Policy & Terms
- **Action Items**:
  - [ ] Create privacy policy
  - [ ] Create terms of service
  - [ ] Add links to privacy policy and terms in app footer

### 2. GDPR/CCPA Compliance
- **Action Items**:
  - [ ] Implement data deletion functionality
  - [ ] Add user data export feature
  - [ ] Document data retention policies

## J. Post-Launch Monitoring

### 1. Week 1 Checklist
- [ ] Monitor error rates daily
- [ ] Check Supabase usage/quotas
- [ ] Monitor response times
- [ ] Review user feedback
- [ ] Check database performance

### 2. Ongoing Maintenance
- [ ] Regular dependency updates
- [ ] Security vulnerability scanning
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Feature usage analytics

## Priority Summary

### P0 (Critical - Block Launch)
1. ✅ Fix trip plan page error handling
2. [ ] Verify production database schema is applied
3. [ ] Configure production Supabase Auth redirect URLs
4. [ ] Test end-to-end trip creation and access flow
5. [ ] Run production build and fix any errors

### P1 (High - Before Launch)
1. [ ] Add error logging/monitoring service
2. [ ] Set up health check endpoint
3. [ ] Add rate limiting to public endpoints
4. [ ] Complete manual testing checklist
5. [ ] Configure CI/CD pipeline

### P2 (Medium - Soon After Launch)
1. [ ] Add integration/E2E tests
2. [ ] Improve error messages for users
3. [ ] Add analytics/tracking
4. [ ] Create user documentation

### P3 (Low - Future Improvements)
1. [ ] Performance optimization
2. [ ] Advanced monitoring
3. [ ] Enhanced offline support
4. [ ] Additional features
