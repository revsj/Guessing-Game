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
- Username is stored in localStorage and mapped to a players row (create if missing).
- Badges are computed from the scores data, not hardcoded in the UI.
- Enter/Return must submit a guess (keep this from v2).
- Secrets go in .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Never commit them.
- Use Tailwind utilities; no custom CSS unless necessary.

## Build phases (do one at a time, stop for review after each)
1. Port the existing game to React with the 3 levels and key events.
2. Username screen + localStorage.
3. Supabase schema, saving scores, per-level leaderboard.
4. Badges.
5. (Later) Server-side validation of results.

## Current state
- Phases 1-4 done: React port, username screen, Supabase scores and per-level leaderboard (/leaderboard), badges.
- Badges are computed on read from scores (plus the leaderboard view for Top 10). Nothing is written to player_badges: its insert policy is open, so stored badges could be faked.
- Next: phase 5, server-side validation of results.

- Usernames are case-insensitive (normalize helper); the player is stored in localStorage as gg:player { id, username }.
- Design pass rules: no logic changes, keep Supabase calls in src/lib/supabase, restyle username, game, and leaderboard screens together.