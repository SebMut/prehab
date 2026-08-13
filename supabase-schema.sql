-- preHIP Cloud-Speicher
-- Dieses Skript einmal im Supabase SQL Editor ausführen.

create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Bestehende Policies bei erneutem Ausführen sauber ersetzen.
drop policy if exists "Users can read own app state" on public.app_state;
drop policy if exists "Users can insert own app state" on public.app_state;
drop policy if exists "Users can update own app state" on public.app_state;
drop policy if exists "Users can delete own app state" on public.app_state;

create policy "Users can read own app state"
on public.app_state for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own app state"
on public.app_state for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own app state"
on public.app_state for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own app state"
on public.app_state for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Data API: Zugriff nur für eingeloggte Benutzer; RLS begrenzt auf die eigene Zeile.
grant select, insert, update, delete on public.app_state to authenticated;
revoke all on public.app_state from anon;
