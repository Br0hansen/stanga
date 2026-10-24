-- Trene sammen: profiler, venner, timer, påmeldinger og tidsforslag.
-- Alt er stengt for anonyme. Hjelpefunksjoner ligger i et eget skjema som ikke er eksponert i API-et.

create schema if not exists private;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  created_at timestamptz not null default now()
);

create table public.seen (
  user_id uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
  last_seen_at timestamptz not null default now()
);

create table public.friendships (
  requester uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  addressee uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (requester, addressee),
  check (requester <> addressee)
);
create unique index friendships_pair on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index friendships_addressee on public.friendships (addressee);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('fixed','window')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  place text check (char_length(place) <= 80),
  workout_kind text not null default 'none' check (workout_kind in ('none','bank','text')),
  workout_ref text check (char_length(workout_ref) <= 40),
  workout_text text check (char_length(workout_text) <= 300),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  check ((kind = 'window' and ends_at is not null and ends_at > starts_at) or (kind = 'fixed' and ends_at is null))
);
create index sessions_owner_start on public.sessions (owner, starts_at);

create table public.participants (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);
create index participants_user on public.participants (user_id);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  proposed_at timestamptz not null,
  comment text check (char_length(comment) <= 120),
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);
create index proposals_session on public.proposals (session_id);

-- Hjelpere (security definer, så de ikke går i ring gjennom tilgangsreglene)
create function private.is_friend(other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester = auth.uid() and f.addressee = other) or (f.requester = other and f.addressee = auth.uid()))
  );
$$;

create function private.can_see_session(sid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.sessions s
    where s.id = sid and (s.owner = auth.uid() or private.is_friend(s.owner))
  );
$$;

create function private.can_see_profile(pid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select pid = auth.uid()
    or exists (select 1 from public.friendships f
               where (f.requester = auth.uid() and f.addressee = pid) or (f.requester = pid and f.addressee = auth.uid()))
    or exists (select 1 from public.participants p where p.user_id = pid and private.can_see_session(p.session_id))
    or exists (select 1 from public.proposals p where p.user_id = pid and private.can_see_session(p.session_id));
$$;

revoke all on function private.is_friend(uuid), private.can_see_session(uuid), private.can_see_profile(uuid) from public, anon;
grant execute on function private.is_friend(uuid), private.can_see_session(uuid), private.can_see_profile(uuid) to authenticated;

-- Tilgangsregler
alter table public.profiles enable row level security;
alter table public.seen enable row level security;
alter table public.friendships enable row level security;
alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.proposals enable row level security;

revoke all on public.profiles, public.seen, public.friendships, public.sessions, public.participants, public.proposals from anon;
revoke update on public.profiles, public.friendships, public.sessions, public.participants, public.proposals from authenticated;
grant update (username, display_name) on public.profiles to authenticated;
grant update (status, accepted_at) on public.friendships to authenticated;
grant update (kind, starts_at, ends_at, place, workout_kind, workout_ref, workout_text, cancelled_at) on public.sessions to authenticated;

create policy "profil: les synlige" on public.profiles for select to authenticated using (private.can_see_profile(id));
create policy "profil: lag egen" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profil: endre egen" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "sett: egen" on public.seen for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "venn: les egne" on public.friendships for select to authenticated
  using (requester = auth.uid() or addressee = auth.uid());
create policy "venn: send forespørsel" on public.friendships for insert to authenticated
  with check (requester = auth.uid() and status = 'pending' and accepted_at is null);
create policy "venn: godta" on public.friendships for update to authenticated
  using (addressee = auth.uid() and status = 'pending')
  with check (addressee = auth.uid() and status = 'accepted');
create policy "venn: fjern" on public.friendships for delete to authenticated
  using (requester = auth.uid() or addressee = auth.uid());

create policy "time: les egne og venners" on public.sessions for select to authenticated
  using (owner = auth.uid() or private.is_friend(owner));
create policy "time: lag egen" on public.sessions for insert to authenticated
  with check (owner = auth.uid() and cancelled_at is null);
create policy "time: endre egen" on public.sessions for update to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());
create policy "time: slett egen" on public.sessions for delete to authenticated using (owner = auth.uid());

create policy "påmelding: les" on public.participants for select to authenticated using (private.can_see_session(session_id));
create policy "påmelding: meld på deg selv" on public.participants for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.sessions s
    where s.id = session_id and s.kind = 'fixed' and s.cancelled_at is null
      and s.owner <> auth.uid() and private.is_friend(s.owner)));
create policy "påmelding: meld av deg selv" on public.participants for delete to authenticated using (user_id = auth.uid());

create policy "forslag: les" on public.proposals for select to authenticated using (private.can_see_session(session_id));
create policy "forslag: foreslå selv" on public.proposals for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.sessions s
    where s.id = session_id and s.kind = 'window' and s.cancelled_at is null
      and s.owner <> auth.uid() and private.is_friend(s.owner)
      and proposed_at between s.starts_at and s.ends_at));
create policy "forslag: trekk eget" on public.proposals for delete to authenticated using (user_id = auth.uid());

-- Søk på brukernavn: maks ti treff, minst to tegn, aldri deg selv
create function public.search_profiles(q text) returns table (id uuid, username text, display_name text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.username, p.display_name from public.profiles p
  where auth.uid() is not null and char_length(q) >= 2
    and p.username like replace(replace(lower(q), '_', '\_'), '%', '\%') || '%'
    and p.id <> auth.uid()
  order by p.username limit 10;
$$;

-- Eieren velger et tidsforslag: timen blir fast, de som foreslo samme tid blir påmeldt, forslagene ryddes
create function public.pick_proposal(pid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.sessions; t timestamptz;
begin
  select pr.proposed_at into t from public.proposals pr where pr.id = pid;
  if t is null then raise exception 'Forslaget finnes ikke'; end if;
  select se.* into s from public.sessions se join public.proposals pr on pr.session_id = se.id where pr.id = pid;
  if s.owner <> auth.uid() then raise exception 'Bare eieren kan velge tidspunkt'; end if;
  if s.kind <> 'window' or s.cancelled_at is not null then raise exception 'Timen kan ikke endres'; end if;
  insert into public.participants (session_id, user_id)
    select s.id, pr.user_id from public.proposals pr where pr.session_id = s.id and pr.proposed_at = t
    on conflict do nothing;
  update public.sessions set kind = 'fixed', starts_at = t, ends_at = null where id = s.id;
  delete from public.proposals where session_id = s.id;
end;
$$;

-- Slett konto: fjerner brukeren, og alt om deg forsvinner med den
create function public.delete_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.search_profiles(text), public.pick_proposal(uuid), public.delete_account() from public, anon;
grant execute on function public.search_profiles(text), public.pick_proposal(uuid), public.delete_account() to authenticated;
