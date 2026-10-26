-- Rettelse av chatvarsler og tall på ikonet.
-- Før: ingen varsel hvis mottakeren hadde lest i samtalen det siste minuttet. Men å sende en melding regnes som å lese,
-- så et svar innen et minutt ga aldri varsel, selv om appen var lukket.
-- Nå: appen sier fra hvert fjerde sekund mens samtalen står åpen på skjermen (viewing_at). Varsel holdes bare tilbake
-- når mottakeren har samtalen åpen akkurat nå, det vil si sist sett for mindre enn ti sekunder siden.
-- Varselet tar også med tallet til ikonet: samtaler med uleste meldinger og påmeldinger og forslag siden du sist var i Sammen.

alter table public.conversation_members add column viewing_at timestamptz;

drop function public.chat_read(uuid);
create function public.chat_read(cid uuid, active boolean default false) returns void
language sql security definer set search_path = '' as $$
  update public.conversation_members set last_read_at = now(), viewing_at = case when active then now() else viewing_at end
  where conversation_id = cid and user_id = auth.uid();
$$;
revoke all on function public.chat_read(uuid, boolean) from public, anon;
grant execute on function public.chat_read(uuid, boolean) to authenticated;

create or replace function private.push_on_message() returns trigger
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
      and (m.viewing_at is null or m.viewing_at < now() - interval '10 seconds')
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

-- Tallet til ikonet for én bruker
create function private.badge_count(u uuid) returns int
language sql stable security definer set search_path = '' as $$
  select (select count(*) from public.conversation_members cm
           where cm.user_id = u and exists (select 1 from public.messages x where x.conversation_id = cm.conversation_id
             and x.created_at > cm.last_read_at and x.user_id <> u and not x.system))::int
       + (select count(*) from public.push_outbox o
           where o.user_id = u and o.kind in ('join', 'prop')
             and o.created_at > coalesce((select last_seen_at from public.seen where user_id = u), '-infinity'))::int;
$$;
revoke all on function private.badge_count(uuid) from public, anon, authenticated;

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
        'tag', case when c.cid is not null then 'msg-' || c.cid::text else c.kind || '-' || coalesce(c.sid::text, '') || '-' || c.id end)
    from c join public.push_subscriptions s on s.user_id = c.user_id;
end;
$$;
