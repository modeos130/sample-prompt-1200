-- Phase 3 hardening: durable owner/admin action audit log.
-- Browser roles intentionally receive no table policies; trusted server routes
-- insert through SUPABASE_SERVICE_ROLE_KEY after successful admin mutations.

begin;

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_email text not null,
  target_user_id uuid references public.profiles(id) on delete set null,
  target_email text,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_events_created_at_idx
  on public.admin_audit_events (created_at desc);

create index if not exists admin_audit_events_actor_idx
  on public.admin_audit_events (actor_user_id, created_at desc);

create index if not exists admin_audit_events_target_idx
  on public.admin_audit_events (target_user_id, created_at desc);

alter table public.admin_audit_events enable row level security;

drop policy if exists "Service full access admin audit events"
  on public.admin_audit_events;
drop policy if exists "admin_audit_events_no_browser_access"
  on public.admin_audit_events;

revoke all on table public.admin_audit_events from anon, authenticated;
grant select, insert, update, delete on table public.admin_audit_events to service_role;

commit;
