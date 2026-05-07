-- Persistent API rate limits for server-side AI routes.

begin;

create table if not exists public.rate_limits (
  scope text not null,
  subject_id text not null,
  window_start timestamptz not null default now(),
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  primary key (scope, subject_id)
);

alter table public.rate_limits enable row level security;

-- No browser-facing policies are intentionally created. Server routes use the
-- service-role key and the RPC below.

create or replace function public.consume_rate_limit(
  p_scope text,
  p_subject_id text,
  p_limit integer,
  p_window_ms integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window interval := make_interval(secs => greatest(p_window_ms, 1000) / 1000.0);
  v_window_start timestamptz;
  v_count integer;
begin
  if p_scope is null or length(trim(p_scope)) = 0 then
    raise exception 'scope required';
  end if;

  if p_subject_id is null or length(trim(p_subject_id)) = 0 then
    raise exception 'subject_id required';
  end if;

  if p_limit <= 0 then
    allowed := false;
    remaining := 0;
    reset_at := v_now + v_window;
    return next;
    return;
  end if;

  insert into public.rate_limits (scope, subject_id, window_start, count, updated_at)
  values (p_scope, p_subject_id, v_now, 0, v_now)
  on conflict (scope, subject_id) do nothing;

  select rl.window_start, rl.count
    into v_window_start, v_count
    from public.rate_limits rl
   where rl.scope = p_scope
     and rl.subject_id = p_subject_id
   for update;

  if v_window_start is null or v_now - v_window_start >= v_window then
    update public.rate_limits
       set window_start = v_now,
           count = 1,
           updated_at = v_now
     where scope = p_scope
       and subject_id = p_subject_id;

    allowed := true;
    remaining := greatest(p_limit - 1, 0);
    reset_at := v_now + v_window;
    return next;
    return;
  end if;

  if v_count >= p_limit then
    allowed := false;
    remaining := 0;
    reset_at := v_window_start + v_window;
    return next;
    return;
  end if;

  update public.rate_limits
     set count = v_count + 1,
         updated_at = v_now
   where scope = p_scope
     and subject_id = p_subject_id;

  allowed := true;
  remaining := greatest(p_limit - v_count - 1, 0);
  reset_at := v_window_start + v_window;
  return next;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer)
  to service_role;

commit;
