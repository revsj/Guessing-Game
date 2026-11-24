create table public.player_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_id uuid not null unique references public.players(id) on delete cascade
);

alter table public.player_accounts enable row level security;
revoke all on public.player_accounts from public, anon, authenticated;

create table public.active_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  level smallint not null check (level between 1 and 3),
  min_value int not null,
  max_value int not null,
  target int not null,
  guesses int not null default 0 check (guesses >= 0),
  status text not null default 'playing' check (status in ('playing', 'won')),
  expires_at timestamptz not null default now() + interval '24 hours'
);

create index active_games_expires_at_idx on public.active_games (expires_at);

alter table public.active_games enable row level security;
revoke all on public.active_games from public, anon, authenticated;

drop policy if exists "insert players" on public.players;
drop policy if exists "insert scores" on public.scores;
drop policy if exists "insert player_badges" on public.player_badges;

revoke insert on public.players, public.scores, public.player_badges
  from public, anon, authenticated;

create or replace function public.get_my_player()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object('id', p.id, 'username', p.username)
  from public.player_accounts pa
  join public.players p on p.id = pa.player_id
  where pa.user_id = auth.uid()
$$;

create or replace function public.claim_username(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_player_id uuid;
  result jsonb;
begin
  if current_user_id is null then
    raise exception 'An authenticated player is required.';
  end if;

  if p_username is null or p_username !~ '^[A-Za-z0-9_-]{3,16}$' then
    raise exception 'Use 3–16 letters, numbers, underscores, or dashes.';
  end if;

  select pa.player_id into current_player_id
  from public.player_accounts pa
  where pa.user_id = current_user_id;

  if current_player_id is null then
    insert into public.players (username)
    values (p_username)
    returning id into current_player_id;

    insert into public.player_accounts (user_id, player_id)
    values (current_user_id, current_player_id);
  else
    update public.players
    set username = p_username
    where id = current_player_id;
  end if;

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

create or replace function public.start_game(p_level smallint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_player_id uuid;
  range_min int;
  range_max int;
  new_game_id uuid;
  random_bytes bytea;
  random_value bigint;
  target_value int;
begin
  if current_user_id is null then
    raise exception 'An authenticated player is required.';
  end if;

  select pa.player_id into current_player_id
  from public.player_accounts pa
  where pa.user_id = current_user_id;

  if current_player_id is null then
    raise exception 'Choose a username before playing.';
  end if;

  case p_level
    when 1 then range_min := 0; range_max := 100;
    when 2 then range_min := 0; range_max := 500;
    when 3 then range_min := 0; range_max := 1000;
    else raise exception 'Invalid game level.';
  end case;

  delete from public.active_games where expires_at <= now();

  -- Derive the hidden target from server-side UUID randomness, not client input.
  random_bytes := decode(
    substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
    'hex'
  );
  random_value :=
    get_byte(random_bytes, 0)::bigint * 16777216
    + get_byte(random_bytes, 1)::bigint * 65536
    + get_byte(random_bytes, 2)::bigint * 256
    + get_byte(random_bytes, 3)::bigint;
  target_value := range_min + floor(
    random_value::numeric * (range_max - range_min + 1) / 4294967296
  )::int;

  insert into public.active_games
    (user_id, player_id, level, min_value, max_value, target)
  values
    (
      current_user_id,
      current_player_id,
      p_level,
      range_min,
      range_max,
      target_value
    )
  returning id into new_game_id;

  return jsonb_build_object(
    'game_id', new_game_id,
    'min_value', range_min,
    'max_value', range_max
  );
end;
$$;

create or replace function public.submit_guess(p_game_id uuid, p_guess numeric)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  game public.active_games%rowtype;
  next_guesses int;
begin
  if auth.uid() is null then
    raise exception 'An authenticated player is required.';
  end if;

  select * into game
  from public.active_games g
  where g.id = p_game_id
    and g.user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Game not found.';
  end if;

  if game.expires_at <= now() then
    raise exception 'This game has expired. Start a new game.';
  end if;

  if p_guess is null or p_guess < game.min_value or p_guess > game.max_value then
    raise exception 'Guess must be within the level range.';
  end if;

  if game.status = 'won' then
    if p_guess = game.target then
      return jsonb_build_object(
        'status', 'won',
        'attempts', game.guesses,
        'target', game.target
      );
    end if;
    raise exception 'This game is already complete.';
  end if;

  next_guesses := game.guesses + 1;

  if p_guess = game.target then
    update public.active_games
    set guesses = next_guesses, status = 'won'
    where id = game.id;

    insert into public.scores (player_id, level, guesses)
    values (game.player_id, game.level, next_guesses);

    return jsonb_build_object(
      'status', 'won',
      'attempts', next_guesses,
      'target', game.target
    );
  end if;

  update public.active_games
  set guesses = next_guesses
  where id = game.id;

  return jsonb_build_object(
    'status', 'playing',
    'result', case when p_guess < game.target then 'low' else 'high' end,
    'attempts', next_guesses
  );
end;
$$;

revoke all on function public.get_my_player() from public, anon, authenticated;
revoke all on function public.claim_username(text) from public, anon, authenticated;
revoke all on function public.start_game(smallint) from public, anon, authenticated;
revoke all on function public.submit_guess(uuid, numeric) from public, anon, authenticated;

grant execute on function public.get_my_player() to authenticated;
grant execute on function public.claim_username(text) to authenticated;
grant execute on function public.start_game(smallint) to authenticated;
grant execute on function public.submit_guess(uuid, numeric) to authenticated;
