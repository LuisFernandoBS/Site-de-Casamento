alter table public.guests enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.guests to authenticated;

drop policy if exists guests_admin_all on public.guests;
create policy guests_admin_all on public.guests
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
