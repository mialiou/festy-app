-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Grants table access to authenticated and anon roles

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON TABLE public.profiles    TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.festivals   TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.experiences TO anon, authenticated, service_role;

-- Also ensure future tables get grants automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
