-- Create feedback table
create table if not exists feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  message text,
  rating int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table feedback enable row level security;

-- Allow authenticated users to insert feedback
create policy "Users can insert feedback"
  on feedback for insert
  with check (auth.uid() = user_id);

-- Allow anonymous feedback (optional, if you want unauthenticated feedback)
create policy "Anyone can insert feedback"
  on feedback for insert
  with check (true);

-- Only admins/service role can view feedback (no select policy for public)
