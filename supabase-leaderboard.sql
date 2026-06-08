-- SKYHOOK leaderboard schema for Supabase + GitHub Pages
-- Run this in Supabase SQL Editor for a fresh setup.

create extension if not exists pgcrypto;

create table if not exists public.leaderboard_scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  altitude integer not null,
  mode text not null default 'normal',
  ip_address text not null default 'unknown',
  country text not null default 'unknown',
  created_at timestamptz not null default now(),

  constraint leaderboard_scores_player_name_len
    check (char_length(btrim(player_name)) between 1 and 16),
  constraint leaderboard_scores_player_name_no_control
    check (player_name !~ '[[:cntrl:]]'),
  constraint leaderboard_scores_altitude_range
    check (altitude between 0 and 1000000),
  constraint leaderboard_scores_mode_check
    check (mode in ('normal', 'extreme')),
  constraint leaderboard_scores_ip_len
    check (char_length(btrim(ip_address)) between 3 and 64),
  constraint leaderboard_scores_country_len
    check (char_length(btrim(country)) between 2 and 64)
);

create index if not exists leaderboard_scores_mode_altitude_idx
  on public.leaderboard_scores (mode, altitude desc, created_at asc);

alter table public.leaderboard_scores enable row level security;
alter table public.leaderboard_scores force row level security;

revoke all on public.leaderboard_scores from anon, authenticated;

grant select (id, player_name, altitude, mode, created_at)
  on public.leaderboard_scores to anon, authenticated;

grant insert (player_name, altitude, mode, ip_address, country)
  on public.leaderboard_scores to anon, authenticated;

drop policy if exists "leaderboard public read" on public.leaderboard_scores;
drop policy if exists "leaderboard public submit" on public.leaderboard_scores;

create policy "leaderboard public read"
on public.leaderboard_scores
for select
to anon, authenticated
using (true);

create policy "leaderboard public submit"
on public.leaderboard_scores
for insert
to anon, authenticated
with check (
  char_length(btrim(player_name)) between 1 and 16
  and player_name !~ '[[:cntrl:]]'
  and altitude between 0 and 1000000
  and mode in ('normal', 'extreme')
  and char_length(btrim(ip_address)) between 3 and 64
  and char_length(btrim(country)) between 2 and 64
);
