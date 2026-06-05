-- SKYHOOK leaderboard schema update for an existing Supabase project
-- Run this in Supabase SQL Editor when leaderboard_scores already exists.

create extension if not exists pgcrypto;

alter table if exists public.leaderboard_scores
  add column if not exists mode text;

alter table if exists public.leaderboard_scores
  add column if not exists ip_address text;

alter table if exists public.leaderboard_scores
  add column if not exists country text;

update public.leaderboard_scores
set mode = coalesce(nullif(mode, ''), 'normal')
where mode is null or mode = '';

update public.leaderboard_scores
set ip_address = coalesce(nullif(ip_address, ''), 'unknown')
where ip_address is null or ip_address = '';

update public.leaderboard_scores
set country = coalesce(nullif(country, ''), 'unknown')
where country is null or country = '';

alter table if exists public.leaderboard_scores
  alter column mode set default 'normal';

alter table if exists public.leaderboard_scores
  alter column ip_address set default 'unknown';

alter table if exists public.leaderboard_scores
  alter column country set default 'unknown';

alter table if exists public.leaderboard_scores
  alter column mode set not null;

alter table if exists public.leaderboard_scores
  alter column ip_address set not null;

alter table if exists public.leaderboard_scores
  alter column country set not null;

alter table if exists public.leaderboard_scores
  drop constraint if exists leaderboard_scores_mode_check;

alter table if exists public.leaderboard_scores
  add constraint leaderboard_scores_mode_check
  check (mode in ('normal', 'extreme'));

alter table if exists public.leaderboard_scores
  drop constraint if exists leaderboard_scores_ip_len;

alter table if exists public.leaderboard_scores
  add constraint leaderboard_scores_ip_len
  check (char_length(btrim(ip_address)) between 3 and 64);

alter table if exists public.leaderboard_scores
  drop constraint if exists leaderboard_scores_country_len;

alter table if exists public.leaderboard_scores
  add constraint leaderboard_scores_country_len
  check (char_length(btrim(country)) between 2 and 64);

create index if not exists leaderboard_scores_mode_altitude_idx
  on public.leaderboard_scores (mode, altitude desc, created_at asc);

create index if not exists leaderboard_scores_altitude_idx
  on public.leaderboard_scores (altitude desc, created_at asc);

alter table if exists public.leaderboard_scores enable row level security;
alter table if exists public.leaderboard_scores force row level security;

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
  and altitude between 0 and 100000
  and mode in ('normal', 'extreme')
  and char_length(btrim(ip_address)) between 3 and 64
  and char_length(btrim(country)) between 2 and 64
);
