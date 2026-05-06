-- BooManLab Supabase RLS hardening migration.
-- Same policy body as scripts/rls_hardening.sql.

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

