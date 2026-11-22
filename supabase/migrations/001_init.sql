create table players (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  created_at timestamptz not null default now()
);

create table scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  level smallint not null check (level between 1 and 3),
  guesses int not null check (guesses > 0),
  created_at timestamptz not null default now()
);

create index scores_level_guesses_idx on scores (level, guesses, created_at);

create table badges (
  code text primary key,
  name text not null,
  description text not null
);

create table player_badges (
  player_id uuid references players(id) on delete cascade,
  badge_code text references badges(code),
  earned_at timestamptz not null default now(),
  primary key (player_id, badge_code)
);

-- Best score per player, per level
create view leaderboard as
select distinct on (s.level, s.player_id)
  s.level, p.username, s.guesses, s.created_at
from scores s
join players p on p.id = s.player_id
order by s.level, s.player_id, s.guesses asc, s.created_at asc;

insert into badges (code, name, description) values
  ('first_win', 'First Win', 'Won your first game'),
  ('lucky_guess', 'Lucky Guess', 'Won in 2 guesses or fewer'),
  ('hard_cleared', 'Hard Mode Cleared', 'Won a Level 3 game'),
  ('top_10', 'Top 10', 'Reached the top 10 on any level');

-- Row level security: public read, public insert (fine for an MVP)
alter table players enable row level security;
alter table scores enable row level security;
alter table badges enable row level security;
alter table player_badges enable row level security;

create policy "read players" on players for select using (true);
create policy "insert players" on players for insert with check (true);
create policy "read scores" on scores for select using (true);
create policy "insert scores" on scores for insert with check (true);
create policy "read badges" on badges for select using (true);
create policy "read player_badges" on player_badges for select using (true);
create policy "insert player_badges" on player_badges for insert with check (true);