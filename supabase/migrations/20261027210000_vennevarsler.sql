-- Pushvarsler for venner: når noen vil legge deg til, og når noen godtar forespørselen din.
-- Før fikk den andre ikke vite noe før appen hentet på nytt, ofte først når den ble startet på nytt.
-- Tallet på ikonet tar også med forespørsler du ikke har svart på, og godkjenninger siden du sist var i Sammen,
-- slik tallet på Sammen-fanen alt gjør. Varselet sier fra om at det skal åpne Venner (view).

create function private.push_on_friend_request() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.push_queue(new.addressee, new.requester, null, 'friend', private.uname(new.requester) || ' vil legge deg til',
    'Venneforespørsel. Trykk for å svare.');
  return new;
end;
$$;
create trigger push_on_friend_request after insert on public.friendships for each row execute function private.push_on_friend_request();

create function private.push_on_friend_accept() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.push_queue(new.requester, new.addressee, null, 'friendok', private.uname(new.addressee) || ' godtok forespørselen din',
    'Dere er venner nå og ser hverandres timer.');
  return new;
end;
$$;
create trigger push_on_friend_accept after update of status on public.friendships for each row
  when (old.status = 'pending' and new.status = 'accepted') execute function private.push_on_friend_accept();

revoke all on function private.push_on_friend_request(), private.push_on_friend_accept() from public, anon, authenticated;

-- Tallet til ikonet for én bruker
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
           where f.requester = u and f.status = 'accepted' and f.accepted_at > seen.at)::int;
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
        'view', case when c.kind in ('friend', 'friendok') then 'friends' end,
        'tag', case when c.cid is not null then 'msg-' || c.cid::text else c.kind || '-' || coalesce(c.sid::text, '') || '-' || c.id end)
    from c join public.push_subscriptions s on s.user_id = c.user_id;
end;
$$;
revoke all on function public.push_claim() from public, anon, authenticated;
grant execute on function public.push_claim() to service_role;
