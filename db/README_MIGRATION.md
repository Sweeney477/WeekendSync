# Database Migrations

## Profiles RLS (fix "Unknown" members in trip People list)

If trip members show as "Unknown" in the People tab, the `profiles` table likely still has a policy that only lets users read their own profile. The members API now reads from a safe `public_profiles` view (id + display_name) and relies on a shared-trip policy to expose names.

**Run once (Supabase Dashboard → SQL Editor):** paste and run the contents of `db/migration_profiles_rls.sql`. This creates the `public_profiles` view and scoped SELECT policies (own profile + shared trip members).

---

# Invite Code Hardening

Adds 12-character invite codes and validates input on join.

**Run once (Supabase Dashboard → SQL Editor):** paste and run the contents of `db/migration_invite_code_hardening.sql`.

---

# Trip Planning MVP Migration

## Overview
This migration adds the database schema for the trip planning MVP features:
- Plan items (itinerary items with dates, locations, reminders)
- Costs (expense tracking with splits)
- Logistics (lodging and transport entries)
- Privacy settings (code-only vs invite-only)
- Emergency contact information

## Running the Migration

1. Connect to your Supabase database
2. Run the SQL file: `db/migration_trip_planning.sql`

Or via Supabase CLI:
```bash
supabase db push
```

## What's Added

### Tables
- `trip_plan_items` - Itinerary items with dates, locations, notes, reminders
- `trip_costs` - Expense tracking
- `trip_cost_splits` - Per-person cost splits
- `trip_logistics` - Lodging and transport entries

### Columns Added to `trips`
- `privacy` - 'code' or 'invite' (default: 'code')
- `emergency_contact` - Optional text field

### RLS Policies
All new tables have Row Level Security policies that:
- Allow trip members to view all data
- Allow trip members to create/edit/delete items (when trip is 'open')
- Respect trip membership checks

## Notes
- All new tables cascade delete when a trip is deleted
- Plan items can be assigned to trip members (owner_id)
- Cost splits track who owes what
- Logistics entries are simple text-based (no deep integrations yet)
