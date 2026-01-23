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
