-- BooManLab Phase 1 — Database Setup
-- Run this on the Supabase project linked to sample-prompt-1200

create table if not exists public.profiles (
  id uuid references auth.users primary key,
  email text not null,
  tier text default 'super_user'
    check (tier in ('super_user','vip','tier2','tier1','free')),
  display_name text,
  active boolean default true,
  created_at timestamptz default now(),
  last_seen timestamptz
);

create table if not exists public.analytics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  prompt_id text,
  genre text,
  tier text,
  country text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.analytics enable row level security;

create policy "Users own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Service full access profiles" on public.profiles
  for all using (true);

create policy "Service full access analytics" on public.analytics
  for all using (true);
