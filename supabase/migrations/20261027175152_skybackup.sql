-- Skybackup: én rad per bruker med hele treningsloggen (det samme som «Lag eksport»).
-- Valgfritt: raden finnes bare hvis brukeren har slått på skybackup. Bare eieren kan lese og skrive den.
-- rev øker med én for hver lagring. Appen lagrer bare hvis rev er den samme som sist den så,
-- så to telefoner ikke kan skrive over hverandre uten at brukeren får velge.

create table public.backups (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 5000000),
  app_version int,
  rev bigint not null default 1,
  updated_at timestamptz not null default now()
);

create function private.backup_rev() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then new.rev := 1;
  else new.rev := old.rev + 1; new.user_id := old.user_id;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger backups_rev before insert or update on public.backups
  for each row execute function private.backup_rev();

alter table public.backups enable row level security;
revoke all on public.backups from anon;
revoke update on public.backups from authenticated;
grant update (data, app_version) on public.backups to authenticated;

create policy "backup: egen" on public.backups for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
