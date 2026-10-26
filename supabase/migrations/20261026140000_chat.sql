-- Chat: samtaler med én venn, grupper og chat på timer.
-- Bare de som er med i en samtale, kan lese og skrive i den. Samtaler og medlemmer endres bare gjennom
-- funksjonene under, som sjekker at du bare legger til venner. Alle i en gruppe kan legge til vennene sine.
-- En time får chat automatisk: eieren og alle som er påmeldt, er med.
-- Varsel: ett per samtale til du har lest den, og ikke mens du nettopp har lest i den.

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('dm','group','session')),
  name text check (char_length(name) between 1 and 40),
  session_id uuid unique references public.sessions(id) on delete cascade,
  dm_key text unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check ((kind = 'session') = (session_id is not null)),
  check ((kind = 'dm') = (dm_key is not null)),
  check (kind <> 'group' or name is not null)
);
create index conversations_created_by on public.conversations (created_by);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  last_push_at timestamptz,
  primary key (conversation_id, user_id)
);
create index conversation_members_user on public.conversation_members (user_id);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  system boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_conversation on public.messages (conversation_id, id);
create index messages_user on public.messages (user_id);

alter table public.push_outbox add column cid uuid references public.conversations(id) on delete cascade;
create index push_outbox_cid on public.push_outbox (cid);

create function private.is_member(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.conversation_members m where m.conversation_id = cid and m.user_id = auth.uid());
$$;
revoke all on function private.is_member(uuid) from public, anon;
grant execute on function private.is_member(uuid) to authenticated;

-- Tilgangsregler
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
revoke all on public.conversations, public.conversation_members, public.messages from anon;
revoke insert, update, delete on public.conversations, public.conversation_members from authenticated;
revoke update, delete on public.messages from authenticated;

create policy "samtale: les egne" on public.conversations for select to authenticated using (private.is_member(id));
create policy "medlem: les i egne samtaler" on public.conversation_members for select to authenticated using (private.is_member(conversation_id));
create policy "melding: les i egne samtaler" on public.messages for select to authenticated using (private.is_member(conversation_id));
create policy "melding: skriv i egne samtaler" on public.messages for insert to authenticated
  with check (user_id = (select auth.uid()) and not system and private.is_member(conversation_id));

-- Du ser profilen (brukernavnet) til dem du er i samtale med, også om dere ikke er venner
create or replace function private.can_see_profile(pid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select pid = auth.uid()
    or exists (select 1 from public.friendships f
               where (f.requester = auth.uid() and f.addressee = pid) or (f.requester = pid and f.addressee = auth.uid()))
    or exists (select 1 from public.participants p where p.user_id = pid and private.can_see_session(p.session_id))
    or exists (select 1 from public.proposals p where p.user_id = pid and private.can_see_session(p.session_id))
    or exists (select 1 from public.conversation_members a join public.conversation_members b on b.conversation_id = a.conversation_id
               where a.user_id = auth.uid() and b.user_id = pid);
$$;

-- Systemlinjer i en samtale, som «@kari la til @ola». De gir ikke varsel.
create function private.chat_note(cid uuid, txt text) returns void
language sql security definer set search_path = '' as $$
  insert into public.messages (conversation_id, user_id, body, system) values (cid, auth.uid(), txt, true);
$$;
create function private.uname(pid uuid) returns text
language sql stable security definer set search_path = '' as $$ select '@' || username from public.profiles where id = pid; $$;

-- Samtale med én venn: finn den eller lag den
create function public.chat_dm(friend uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare k text; c uuid;
begin
  if not private.is_friend(friend) then raise exception 'Du kan bare skrive til venner'; end if;
  k := least(auth.uid(), friend)::text || ':' || greatest(auth.uid(), friend)::text;
  insert into public.conversations (kind, dm_key, created_by) values ('dm', k, auth.uid()) on conflict (dm_key) do nothing;
  select id into c from public.conversations where dm_key = k;
  insert into public.conversation_members (conversation_id, user_id) values (c, auth.uid()), (c, friend) on conflict do nothing;
  return c;
end;
$$;

-- Ny gruppe med navn og venner
create function public.chat_group(name text, members uuid[]) returns uuid
language plpgsql security definer set search_path = '' as $$
declare c uuid; n text := btrim(chat_group.name); m uuid;
begin
  if auth.uid() is null then raise exception 'Du må være innlogget'; end if;
  if n = '' or char_length(n) > 40 then raise exception 'Gi gruppen et navn på 1–40 tegn'; end if;
  if coalesce(array_length(members, 1), 0) = 0 then raise exception 'Velg minst én venn'; end if;
  foreach m in array members loop
    if not private.is_friend(m) then raise exception 'Du kan bare legge til venner'; end if;
  end loop;
  insert into public.conversations (kind, name, created_by) values ('group', n, auth.uid()) returning id into c;
  insert into public.conversation_members (conversation_id, user_id)
    select c, u from unnest(array_append(members, auth.uid())) u on conflict do nothing;
  perform private.chat_note(c, private.uname(auth.uid()) || ' lagde gruppen');
  return c;
end;
$$;

-- Legg til venner i en gruppe du er med i
create function public.chat_add(cid uuid, members uuid[]) returns void
language plpgsql security definer set search_path = '' as $$
declare m uuid; added text[] := '{}';
begin
  if not exists (select 1 from public.conversations where id = cid and kind = 'group') or not private.is_member(cid) then
    raise exception 'Du er ikke med i denne gruppen'; end if;
  foreach m in array coalesce(members, '{}') loop
    if not private.is_friend(m) then raise exception 'Du kan bare legge til venner'; end if;
    insert into public.conversation_members (conversation_id, user_id) values (cid, m) on conflict do nothing;
    if found then added := added || private.uname(m); end if;
  end loop;
  if array_length(added, 1) > 0 then
    perform private.chat_note(cid, private.uname(auth.uid()) || ' la til ' || array_to_string(added, ', '));
  end if;
end;
$$;

-- Forlat en gruppe. Den siste som går, sletter gruppen.
create function public.chat_leave(cid uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.conversations where id = cid and kind = 'group') then raise exception 'Bare grupper kan forlates'; end if;
  delete from public.conversation_members where conversation_id = cid and user_id = auth.uid();
  if not found then return; end if;
  if exists (select 1 from public.conversation_members where conversation_id = cid) then
    perform private.chat_note(cid, private.uname(auth.uid()) || ' forlot gruppen');
  else
    delete from public.conversations where id = cid;
  end if;
end;
$$;

-- Merk samtalen som lest
create function public.chat_read(cid uuid) returns void
language sql security definer set search_path = '' as $$
  update public.conversation_members set last_read_at = now() where conversation_id = cid and user_id = auth.uid();
$$;

-- Samtalene dine med siste melding og antall uleste. Går gjennom tilgangsreglene som deg.
create function public.chat_list() returns table (id uuid, kind text, name text, session_id uuid, s_start timestamptz, s_owner uuid,
  members uuid[], last_body text, last_user uuid, last_system boolean, last_at timestamptz, unread int)
language sql stable security invoker set search_path = '' as $$
  select c.id, c.kind, c.name, c.session_id, s.starts_at, s.owner,
    array(select m2.user_id from public.conversation_members m2 where m2.conversation_id = c.id order by m2.joined_at),
    l.body, l.user_id, l.system, coalesce(l.created_at, c.created_at),
    (select count(*)::int from public.messages x
      where x.conversation_id = c.id and x.created_at > m.last_read_at and x.user_id <> m.user_id and not x.system)
  from public.conversation_members m
  join public.conversations c on c.id = m.conversation_id
  left join public.sessions s on s.id = c.session_id
  left join lateral (select x.body, x.user_id, x.system, x.created_at from public.messages x
                     where x.conversation_id = c.id order by x.id desc limit 1) l on true
  where m.user_id = (select auth.uid())
  order by coalesce(l.created_at, c.created_at) desc;
$$;

revoke all on function public.chat_dm(uuid), public.chat_group(text, uuid[]), public.chat_add(uuid, uuid[]), public.chat_leave(uuid),
  public.chat_read(uuid), public.chat_list() from public, anon;
grant execute on function public.chat_dm(uuid), public.chat_group(text, uuid[]), public.chat_add(uuid, uuid[]), public.chat_leave(uuid),
  public.chat_read(uuid), public.chat_list() to authenticated;
revoke all on function private.chat_note(uuid, text), private.uname(uuid) from public, anon, authenticated;

-- Chat på timer: lages med timen, og påmeldte kommer og går med påmeldingen
create function private.chat_on_session() returns trigger
language plpgsql security definer set search_path = '' as $$
declare c uuid;
begin
  insert into public.conversations (kind, session_id, created_by) values ('session', new.id, new.owner) returning id into c;
  insert into public.conversation_members (conversation_id, user_id) values (c, new.owner);
  return new;
end;
$$;
create trigger chat_on_session after insert on public.sessions for each row execute function private.chat_on_session();

create function private.chat_on_participant() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.conversation_members (conversation_id, user_id)
      select c.id, new.user_id from public.conversations c where c.session_id = new.session_id on conflict do nothing;
    return new;
  end if;
  delete from public.conversation_members m using public.conversations c, public.sessions s
    where c.id = m.conversation_id and c.session_id = old.session_id and s.id = old.session_id
      and m.user_id = old.user_id and s.owner <> old.user_id;
  return old;
end;
$$;
create trigger chat_on_participant after insert or delete on public.participants for each row execute function private.chat_on_participant();

-- Timer som finnes fra før, får chat også
insert into public.conversations (kind, session_id, created_by) select 'session', s.id, s.owner from public.sessions s on conflict do nothing;
insert into public.conversation_members (conversation_id, user_id)
  select c.id, s.owner from public.conversations c join public.sessions s on s.id = c.session_id
  union select c.id, p.user_id from public.conversations c join public.participants p on p.session_id = c.session_id
  on conflict do nothing;

-- Varsel om ny melding: ett per samtale til mottakeren har lest den, og ikke hvis hen leste i den det siste minuttet
create function private.push_on_message() returns trigger
language plpgsql security definer set search_path = '' as $$
declare c public.conversations; who text; ttl text; n int;
begin
  if new.system then return new; end if;
  select * into c from public.conversations where id = new.conversation_id;
  who := private.uname(new.user_id);
  ttl := case c.kind when 'dm' then who when 'group' then c.name
    else (select 'Timen ' || private.day_txt(s.starts_at) || ' kl. ' || private.hm(s.starts_at) from public.sessions s where s.id = c.session_id) end;
  with r as (
    update public.conversation_members m set last_push_at = now()
    where m.conversation_id = new.conversation_id and m.user_id <> new.user_id
      and (m.last_push_at is null or m.last_push_at <= m.last_read_at)
      and m.last_read_at < now() - interval '1 minute'
      and exists (select 1 from public.push_subscriptions p where p.user_id = m.user_id)
    returning m.user_id)
  insert into public.push_outbox (user_id, actor, cid, kind, title, body)
    select r.user_id, new.user_id, new.conversation_id, 'msg', coalesce(ttl, 'Stanga'),
      case when c.kind = 'dm' then '' else who || ': ' end || left(new.body, 140)
    from r;
  get diagnostics n = row_count;
  if n > 0 then perform private.push_kick(); end if;
  return new;
end;
$$;
create trigger push_on_message after insert on public.messages for each row execute function private.push_on_message();
revoke all on function private.chat_on_session(), private.chat_on_participant(), private.push_on_message() from public, anon, authenticated;

-- Utboksen tar med samtalen, så et trykk på varselet åpner den. Varsler fra samme samtale erstatter hverandre på telefonen.
create or replace function public.push_claim() returns table (id bigint, endpoint text, p256dh text, auth text, payload jsonb)
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.push_outbox o where o.created_at < now() - interval '7 days';
  return query
    with c as (
      update public.push_outbox o set sent_at = now()
      where o.sent_at is null and o.created_at > now() - interval '1 hour'
      returning o.id, o.user_id, o.sid, o.cid, o.kind, o.title, o.body)
    select c.id, s.endpoint, s.p256dh, s.auth,
      jsonb_build_object('title', c.title, 'body', c.body, 'sid', c.sid, 'cid', c.cid,
        'tag', case when c.cid is not null then 'msg-' || c.cid::text else c.kind || '-' || coalesce(c.sid::text, '') || '-' || c.id end)
    from c join public.push_subscriptions s on s.user_id = c.user_id;
end;
$$;
