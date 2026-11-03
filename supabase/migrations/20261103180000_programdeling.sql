-- Dele egne programmer med venner. Begge må si ja: avsenderen velger vennen og bekrefter, og mottakeren må godta.
-- Raden har en kopi av programmet (øktene, øvelsene og reglene, ikke vektene). Når mottakeren godtar, legger appen
-- kopien inn hos mottakeren. Endrer avsenderen programmet senere, endres ikke kopien.
create table public.program_shares (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  recipient uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  program jsonb not null check (jsonb_typeof(program) = 'object' and pg_column_size(program) <= 65536),
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  check (sender <> recipient)
);
create index program_shares_recipient on public.program_shares (recipient);
create index program_shares_sender on public.program_shares (sender);
-- Samme program til samme venn bare én gang mens det venter på svar
create unique index program_shares_pending on public.program_shares (sender, recipient, name) where status = 'pending';

alter table public.program_shares enable row level security;
revoke all on public.program_shares from anon;
revoke update on public.program_shares from authenticated;
grant update (status, answered_at) on public.program_shares to authenticated;

create policy "programdeling: les egne" on public.program_shares for select to authenticated
  using (sender = (select auth.uid()) or recipient = (select auth.uid()));
create policy "programdeling: send til en venn" on public.program_shares for insert to authenticated
  with check (sender = (select auth.uid()) and status = 'pending' and answered_at is null and private.is_friend(recipient));
create policy "programdeling: svar" on public.program_shares for update to authenticated
  using (recipient = (select auth.uid()) and status = 'pending')
  with check (recipient = (select auth.uid()) and status in ('accepted','declined'));
create policy "programdeling: trekk tilbake eller fjern" on public.program_shares for delete to authenticated
  using (sender = (select auth.uid()) or recipient = (select auth.uid()));

-- Pushvarsler: mottakeren når noen deler, avsenderen når programmet blir tatt imot. Et avslag varsler ingen.
create function private.push_on_program_share() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.push_queue(new.recipient, new.sender, null, 'prog', private.uname(new.sender) || ' vil dele et program med deg',
    '«' || new.name || '». Trykk for å se det og svare.');
  return new;
end;
$$;
create trigger push_on_program_share after insert on public.program_shares for each row execute function private.push_on_program_share();

create function private.push_on_program_accept() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.push_queue(new.sender, new.recipient, null, 'progok', private.uname(new.recipient) || ' tok imot programmet ditt',
    '«' || new.name || '» ligger nå hos ' || private.uname(new.recipient) || '.');
  return new;
end;
$$;
create trigger push_on_program_accept after update of status on public.program_shares for each row
  when (old.status = 'pending' and new.status = 'accepted') execute function private.push_on_program_accept();

revoke all on function private.push_on_program_share(), private.push_on_program_accept() from public, anon, authenticated;

-- Tallet på ikonet tar med programmer som venter på svar, og programmer som er tatt imot siden du sist var i Sammen
create or replace function private.badge_count(u uuid) returns int
language sql stable security definer set search_path = '' as $$
  with seen as (select coalesce((select last_seen_at from public.seen where user_id = u), '-infinity') as at)
  select (select count(*) from public.conversation_members cm
           where cm.user_id = u and exists (select 1 from public.messages x where x.conversation_id = cm.conversation_id
             and x.created_at > cm.last_read_at and x.user_id <> u and not x.system))::int
       + (select count(*) from public.push_outbox o, seen
           where o.user_id = u and o.kind in ('join', 'prop') and o.created_at > seen.at)::int
       + (select count(*) from public.friendships f where f.addressee = u and f.status = 'pending')::int
       + (select count(*) from public.friendships f, seen
           where f.requester = u and f.status = 'accepted' and f.accepted_at > seen.at)::int
       + (select count(*) from public.program_shares p where p.recipient = u and p.status = 'pending')::int
       + (select count(*) from public.program_shares p, seen
           where p.sender = u and p.status = 'accepted' and p.answered_at > seen.at)::int;
$$;
revoke all on function private.badge_count(uuid) from public, anon, authenticated;

-- Varslene om programmer åpner Venner, der delingene står
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
      jsonb_build_object('title', c.title, 'body', c.body, 'sid', c.sid, 'cid', c.cid, 'badge', private.badge_count(c.user_id),
        'view', case when c.kind in ('friend', 'friendok', 'prog', 'progok') then 'friends' end,
        'tag', case when c.cid is not null then 'msg-' || c.cid::text else c.kind || '-' || coalesce(c.sid::text, '') || '-' || c.id end)
    from c join public.push_subscriptions s on s.user_id = c.user_id;
end;
$$;
revoke all on function public.push_claim() from public, anon, authenticated;
grant execute on function public.push_claim() to service_role;
