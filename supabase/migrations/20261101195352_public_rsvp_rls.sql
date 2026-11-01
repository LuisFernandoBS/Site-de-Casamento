alter table public.guests enable row level security;
alter table public.guest_history enable row level security;

-- Anyone can submit an RSVP, but the inserted row must be public-origin.
drop policy if exists guests_insert_public on public.guests;
create policy guests_insert_public on public.guests
  for insert
  to anon, authenticated
  with check (source = 'public');

-- SELECT is required when Supabase returns the inserted guest id.
-- It also allows the existing public guest lookup to continue working.
drop policy if exists guests_select_public on public.guests;
create policy guests_select_public on public.guests
  for select
  to anon, authenticated
  using (source = 'public');

drop policy if exists guests_select_admin on public.guests;
create policy guests_select_admin on public.guests
  for select
  to authenticated
  using (auth.uid() is not null);

drop policy if exists guests_update_admin on public.guests;
create policy guests_update_admin on public.guests
  for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists guests_delete_admin on public.guests;
create policy guests_delete_admin on public.guests
  for delete
  to authenticated
  using (auth.uid() is not null);

drop policy if exists history_select_admin on public.guest_history;
create policy history_select_admin on public.guest_history
  for select
  to authenticated
  using (auth.uid() is not null);

drop policy if exists history_insert_admin on public.guest_history;
create policy history_insert_admin on public.guest_history
  for insert
  to authenticated
  with check (auth.uid() is not null);
