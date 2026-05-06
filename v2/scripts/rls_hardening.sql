-- BooManLab Supabase RLS hardening
-- Review before running in Supabase SQL Editor.
--
-- Purpose:
-- 1. Remove the unsafe "using (true)" policies from the original setup script.
-- 2. Keep normal users limited to their own profile.
-- 3. Keep analytics write/read access server-side only.
--
-- The Next.js server-side admin APIs use SUPABASE_SERVICE_ROLE_KEY and bypass RLS
-- for owner-approved admin actions. Do not expose that key to the browser.

begin;

alter table public.profiles enable row level security;
alter table public.analytics enable row level security;

drop policy if exists "Service full access profiles" on public.profiles;
drop policy if exists "Service full access analytics" on public.analytics;
drop policy if exists "Users own profile" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "analytics_insert_own" on public.analytics;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Profiles are updated by server routes with the service-role key.
-- No browser update/delete policy is intentionally created because tier and
-- active status are security-sensitive.
--
-- Analytics are written by server routes with the service-role key.
-- No browser select/insert/update/delete policy is intentionally created.

commit;
