-- preHIP Cloud-Speicher
-- Dieses Skript im Supabase SQL Editor ausführen.

create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;
drop policy if exists "Users can read own app state" on public.app_state;
drop policy if exists "Users can insert own app state" on public.app_state;
drop policy if exists "Users can update own app state" on public.app_state;
drop policy if exists "Users can delete own app state" on public.app_state;
create policy "Users can read own app state" on public.app_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own app state" on public.app_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own app state" on public.app_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own app state" on public.app_state for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.app_state to authenticated;
revoke all on public.app_state from anon;

-- Gemeinsamer, moderierter Sportarten-Katalog.
-- Nutzer dürfen freigegebene Sportarten lesen, aber nicht selbst freischalten.
create table if not exists public.sports_catalog (
  id bigint generated always as identity primary key,
  name text not null,
  normalized_name text not null unique,
  icon text not null default '🏃',
  category text not null default 'Sport',
  approved boolean not null default true,
  created_at timestamptz not null default now(),
  check (char_length(name) between 3 and 40),
  check (char_length(normalized_name) between 3 and 50)
);
alter table public.sports_catalog enable row level security;
drop policy if exists "Everyone can read approved sports" on public.sports_catalog;
create policy "Everyone can read approved sports" on public.sports_catalog for select to anon, authenticated using (approved = true);
revoke all on public.sports_catalog from anon, authenticated;
grant select on public.sports_catalog to anon, authenticated;

-- Neue Sportarten werden zunächst nur als Vorschlag gespeichert.
-- Erst nach manueller/fachlicher Freigabe werden sie in sports_catalog übernommen.
create table if not exists public.sport_suggestions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (user_id, normalized_name),
  check (char_length(name) between 3 and 40),
  check (char_length(normalized_name) between 3 and 50)
);
alter table public.sport_suggestions enable row level security;
drop policy if exists "Users can submit own sport suggestions" on public.sport_suggestions;
drop policy if exists "Users can read own sport suggestions" on public.sport_suggestions;
create policy "Users can submit own sport suggestions" on public.sport_suggestions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can read own sport suggestions" on public.sport_suggestions for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.sport_suggestions from anon, authenticated;
grant select, insert on public.sport_suggestions to authenticated;

insert into public.sports_catalog (name, normalized_name, icon, category) values
 ('Spaziergang','spaziergang','🚶','Alltag'),('Radfahren','radfahren','🚴','Ausdauer'),('Rudergerät','rudergerat','🚣','Ausdauer'),('Schwimmen','schwimmen','🏊','Ausdauer'),
 ('Krafttraining','krafttraining','💪','Kraft'),('Mobilität','mobilitat','🧘','Mobilität'),('Wandern','wandern','🥾','Ausdauer'),('Nordic Walking','nordic walking','🚶','Ausdauer'),
 ('Walking','walking','🏃','Ausdauer'),('Joggen','joggen','🏃','Ausdauer'),('Yoga','yoga','🧘','Mobilität'),('Pilates','pilates','🧘','Rumpf'),
 ('Aqua-Fitness','aqua-fitness','🏊','Ausdauer'),('Wassergymnastik','wassergymnastik','🏊','Mobilität'),('Fitnessstudio','fitnessstudio','🏋️','Kraft'),('Crosstrainer','crosstrainer','🚴','Ausdauer'),
 ('Tanzen','tanzen','💃','Koordination'),('Gymnastik','gymnastik','🤸','Mobilität'),('Tennis','tennis','🎾','Sport'),('Tischtennis','tischtennis','🏓','Sport'),
 ('Badminton','badminton','🏸','Sport'),('Pickleball','pickleball','🏓','Sport'),('Padel','padel','🎾','Sport'),('Golf','golf','🏌️','Sport'),
 ('Basketball','basketball','🏀','Sport'),('Fußball','fussball','⚽','Sport'),('Volleyball','volleyball','🏐','Sport'),('Handball','handball','🤾','Sport'),
 ('Klettern','klettern','🧗','Sport'),('Skifahren','skifahren','🎿','Sport'),('Skilanglauf','skilanglauf','🎿','Ausdauer')
on conflict (normalized_name) do nothing;
