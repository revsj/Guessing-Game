# Guessing Game 3.0

Number guessing game with usernames, per-level leaderboards, and badges.

## Stack
- Vite + React (TypeScript optional)
- Tailwind CSS
- Supabase (Postgres) via @supabase/supabase-js
- Deploy on Vercel

## Structure
src/
  components/    UI only (UsernameScreen, GameBoard, Leaderboard, BadgeList)
  hooks/         useGame.js (game state + logic), usePlayer.js (username + player row)
  lib/supabase/  client.js, scores.js, badges.js  <- ALL Supabase calls live here
  pages/         Home, Play, Leaderboard
supabase/
  migrations/    SQL files, one per change

## Rules
- Components never call Supabase directly. Go through /lib/supabase.
- Game logic lives in useGame, not in components.
- Levels: 1 = easy, 2 = medium, 3 = hard. Keep ranges in one constants file.
- Leaderboard is per level. Rank = best (min) guesses per player, ties broken by earliest created_at.
- Username is owned by a Supabase anonymous-auth identity; localStorage is display cache only.
- Guess targets and attempt counts are server-side. Do not reintroduce client score inserts.
- Public clients cannot insert into players, scores, or player_badges.
- A released username stays reserved to its original player; only that player may reclaim it.
- Badges are computed from the scores data, not hardcoded in the UI.
- Enter/Return must submit a guess (keep this from v2).
- Secrets go in .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Never commit them.
- Use Tailwind utilities; no custom CSS unless necessary.

## Build phases (do one at a time, stop for review after each)
1. Port the existing game to React with the 3 levels and key events.
2. Username screen + localStorage.
3. Supabase schema, saving scores, per-level leaderboard.
4. Badges.
5. Server-side validation of results (implemented via database RPCs).

## Current state
- Phases 1-5 done: React port, username screen, Supabase scores and per-level leaderboard (/leaderboard), badges, and server-validated game rounds.
- Badges are computed on read from scores (plus the leaderboard view for Top 10). Nothing is written to player_badges, and public inserts are revoked.
- Supabase anonymous sign-ins must be enabled for deployments.
- Migration 004 keeps released usernames reserved (own-name reclaim allowed) and revokes leftover write grants.
- Apply 003 and 004 and enable anonymous sign-ins before deploying the phase-5 client; the new client fails without them.

- Usernames are case-insensitive (normalize helper); localStorage stores a non-authoritative gg:player display cache.
- Design pass rules: no logic changes, keep Supabase calls in src/lib/supabase, restyle username, game, and leaderboard screens together.