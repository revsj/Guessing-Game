-- 004: keep released usernames reserved and tighten table grants.
--
-- Phase 5 bound players to auth identities, but "Change name" still freed the
-- old name, so another player could claim it and inherit the display name on
-- the leaderboard (which joins scores by player_id but shows players.username).
--
-- A name that has been used stays owned by that player forever. The same
-- player may reclaim it; everyone else is rejected. Legacy players are already
-- protected by the players.username unique index.

create table if not exists public.retired_usernames (
  name_key text primary key,
  former_player_id uuid not null references public.players(id) on delete cascade,
  retired_at timestamptz not null default now()
);

alter table public.retired_usernames enable row level security;
revoke all on public.retired_usernames from public, anon, authenticated;

create or replace function public.claim_username(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_player_id uuid;
  current_username text;
  requested_key text;
  result jsonb;
begin
  if current_user_id is null then
    raise exception 'An authenticated player is required.';
  end if;

  if p_username is null or p_username !~ '^[A-Za-z0-9_-]{3,16}$' then
    raise exception 'Use 3–16 letters, numbers, underscores, or dashes.';
  end if;

  requested_key := lower(p_username);

  select pa.player_id into current_player_id
  from public.player_accounts pa
  where pa.user_id = current_user_id;

  if current_player_id is not null then
    select p.username into current_username
    from public.players p
    where p.id = current_player_id;
  end if;

  -- A name released by another player stays reserved to them. A brand-new
  -- player (null id) can never match, so every retired row blocks them.
  if exists (
    select 1
    from public.retired_usernames r
    where r.name_key = requested_key
      and r.former_player_id is distinct from current_player_id
  ) then
    raise exception 'That name is no longer available.';
  end if;

  if current_player_id is null then
    insert into public.players (username)
    values (p_username)
    returning id into current_player_id;

    insert into public.player_accounts (user_id, player_id)
    values (current_user_id, current_player_id);
  else
    -- Retire the name being left behind before adopting the new one.
    if current_username is not null and lower(current_username) <> requested_key then
      insert into public.retired_usernames (name_key, former_player_id)
      values (lower(current_username), current_player_id)
      on conflict (name_key) do nothing;
    end if;

    update public.players
    set username = p_username
    where id = current_player_id;
  end if;

  -- Re-check after the write. A concurrent rename can commit between the first
  -- check and this insert/update; the unique index frees the name at the same
  -- moment the retirement row lands, so this second look closes that window.
  if exists (
    select 1
    from public.retired_usernames r
    where r.name_key = requested_key
      and r.former_player_id is distinct from current_player_id
  ) then
    raise exception 'That name is no longer available.';
  end if;

  -- Reclaiming your own old name removes the retirement.
  delete from public.retired_usernames
  where name_key = requested_key
    and former_player_id = current_player_id;

  select jsonb_build_object('id', p.id, 'username', p.username)
    into result
  from public.players p
  where p.id = current_player_id;

  return result;
exception
  when unique_violation then
    raise exception 'That name is already taken.' using errcode = '23505';
end;
$$;

revoke all on function public.claim_username(text) from public, anon, authenticated;
grant execute on function public.claim_username(text) to authenticated;

-- Defense in depth: RLS already blocks writes, but the default grants are wider
-- than the app needs. Reference data (badges) is read-only too.
revoke insert, update, delete, truncate
  on public.players, public.scores, public.badges, public.player_badges
  from public, anon, authenticated;
