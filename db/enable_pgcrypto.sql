-- Enable pgcrypto extension
create extension if not exists pgcrypto schema public;

-- Grant usage just in case
grant usage on schema public to postgres, anon, authenticated, service_role;
