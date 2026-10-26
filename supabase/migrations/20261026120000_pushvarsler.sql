-- Pushvarsler: når noen melder seg på eller foreslår tid på timen din.
-- Hver telefon som har slått på varsler, har et abonnement. Triggerne legger varselet i en utboks
-- og vekker edge-funksjonen «push», som sender det som ligger der. Funksjonen trenger derfor ingen nøkkel
-- i kallet: den sender bare det som allerede ligger i utboksen.
-- VAPID-nøklene lages av funksjonen første gang og ligger i Vault, aldri i koden.

create extension if not exists pg_net with schema extensions;

create table public.push_subscriptions (
  endpoint text primary key check (endpoint like 'https://%' and char_length(endpoint) <= 1000),
  user_id uuid not null references public.profiles(id) on delete cascade,
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now()
);
create index push_subscriptions_user on public.push_subscriptions (user_id);

create table public.push_outbox (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor uuid references public.profiles(id) on delete cascade,
  sid uuid references public.sessions(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index push_outbox_unsent on public.push_outbox (created_at) where sent_at is null;
create index push_outbox_user on public.push_outbox (user_id);
create index push_outbox_actor on public.push_outbox (actor);
create index push_outbox_sid on public.push_outbox (sid);

-- Du ser og fjerner bare dine egne abonnementer. Utboksen er stengt for alle utenom funksjonen.
alter table public.push_subscriptions enable row level security;
alter table public.push_outbox enable row level security;
revoke all on public.push_subscriptions, public.push_outbox from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;
create policy "push: les egne" on public.push_subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy "push: fjern egne" on public.push_subscriptions for delete to authenticated using (user_id = (select auth.uid()));

-- Tekst for tidspunkt i norsk tid: «i dag», «i morgen» eller «torsdag 30. okt»
create function private.day_txt(t timestamptz) returns text
language sql stable set search_path = '' as $$
  select case ((t at time zone 'Europe/Oslo')::date - (now() at time zone 'Europe/Oslo')::date)
    when 0 then 'i dag' when 1 then 'i morgen'
    else (array['mandag','tirsdag','onsdag','torsdag','fredag','lørdag','søndag'])[extract(isodow from t at time zone 'Europe/Oslo')::int]
      || ' ' || extract(day from t at time zone 'Europe/Oslo')::int || '. '
      || (array['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des'])[extract(month from t at time zone 'Europe/Oslo')::int]
  end;
$$;
create function private.hm(t timestamptz) returns text
language sql stable set search_path = '' as $$ select to_char(t at time zone 'Europe/Oslo', 'HH24:MI'); $$;

-- Vekk edge-funksjonen. pg_net sender kallet først når transaksjonen er lagret, så varselet ligger klart.
create function private.push_kick() returns void
language sql security definer set search_path = '' as $$
  select net.http_post(url := 'https://ueqteavqpityrmuczkoc.supabase.co/functions/v1/push',
    body := '{}'::jsonb, headers := '{"Content-Type": "application/json"}'::jsonb);
$$;

-- Legg et varsel i utboksen. Samme varsel fra samme person på samme time sendes høyst én gang per ti minutter,
-- så det ikke kommer en strøm av varsler om noen melder seg på og av igjen. Et nytt tidsforslag har ny tekst og sendes.
create function private.push_queue(rcpt uuid, who uuid, s uuid, k text, ttl text, txt text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.push_subscriptions where user_id = rcpt) then return; end if;
  if k <> 'test' and exists (select 1 from public.push_outbox o where o.user_id = rcpt and o.actor is not distinct from who
             and o.sid is not distinct from s and o.kind = k and o.title = ttl and o.created_at > now() - interval '10 minutes') then return; end if;
  insert into public.push_outbox (user_id, actor, sid, kind, title, body) values (rcpt, who, s, k, ttl, txt);
  perform private.push_kick();
end;
$$;

-- Påmelding: bare når noen melder seg på selv. Når eieren velger et tidsforslag, meldes andre på, og da varsles ingen.
create function private.push_on_participant() returns trigger
language plpgsql security definer set search_path = '' as $$
declare s public.sessions; who text;
begin
  if new.user_id is distinct from (select auth.uid()) then return new; end if;
  select * into s from public.sessions where id = new.session_id;
  if s.owner = new.user_id then return new; end if;
  select '@' || username into who from public.profiles where id = new.user_id;
  perform private.push_queue(s.owner, new.user_id, s.id, 'join', who || ' blir med',
    'Timen din ' || private.day_txt(s.starts_at) || ' kl. ' || private.hm(s.starts_at) || coalesce(' · ' || nullif(s.place, ''), ''));
  return new;
end;
$$;
create trigger push_on_participant after insert on public.participants for each row execute function private.push_on_participant();

-- Tidsforslag på en time med tidsvindu
create function private.push_on_proposal() returns trigger
language plpgsql security definer set search_path = '' as $$
declare s public.sessions; who text;
begin
  select * into s from public.sessions where id = new.session_id;
  select '@' || username into who from public.profiles where id = new.user_id;
  perform private.push_queue(s.owner, new.user_id, s.id, 'prop', who || ' foreslår ' || private.hm(new.proposed_at),
    'Tidsvinduet ditt ' || private.day_txt(s.starts_at) || ' ' || private.hm(s.starts_at) || '–' || private.hm(s.ends_at)
    || coalesce(' · «' || nullif(new.comment, '') || '»', ''));
  return new;
end;
$$;
create trigger push_on_proposal after insert on public.proposals for each row execute function private.push_on_proposal();

revoke all on function private.day_txt(timestamptz), private.hm(timestamptz), private.push_kick(),
  private.push_queue(uuid, uuid, uuid, text, text, text), private.push_on_participant(), private.push_on_proposal() from public, anon, authenticated;

-- Fra appen: lagre abonnementet for denne telefonen. Har telefonen vært brukt av en annen konto, tas den over.
create function public.push_register(endpoint text, p256dh text, auth text) returns void
language sql security definer set search_path = '' as $$
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  select push_register.endpoint, auth.uid(), push_register.p256dh, push_register.auth where auth.uid() is not null
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
$$;

-- Fra appen: send et testvarsel til deg selv
create function public.push_test() returns void
language sql security definer set search_path = '' as $$
  select private.push_queue(auth.uid(), auth.uid(), null, 'test', 'Varsler er på',
    'Du får varsel her når noen blir med på timene dine.') where auth.uid() is not null;
$$;

-- Fra appen: den offentlige VAPID-nøkkelen, som nettleseren trenger for å abonnere
create function public.push_public_key() returns text
language sql stable security definer set search_path = '' as $$
  select (decrypted_secret::jsonb) ->> 'publicKey' from vault.decrypted_secrets where name = 'push_vapid';
$$;

revoke all on function public.push_register(text, text, text), public.push_test(), public.push_public_key() from public, anon;
grant execute on function public.push_register(text, text, text), public.push_test(), public.push_public_key() to authenticated;

-- Bare for edge-funksjonen (service_role): hent nøklene, lagre nye første gang, og hent det som skal sendes
create function public.push_vapid() returns jsonb
language sql stable security definer set search_path = '' as $$
  select decrypted_secret::jsonb from vault.decrypted_secrets where name = 'push_vapid';
$$;
create function public.push_vapid_set(v jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtext('push_vapid'));
  if not exists (select 1 from vault.secrets where name = 'push_vapid') then
    perform vault.create_secret(v::text, 'push_vapid', 'VAPID-nøkler for pushvarsler');
  end if;
  return (select decrypted_secret::jsonb from vault.decrypted_secrets where name = 'push_vapid');
end;
$$;
-- Merk varslene som sendt i samme slag som de hentes, så de aldri sendes to ganger. Rydd bort gamle.
create function public.push_claim() returns table (id bigint, endpoint text, p256dh text, auth text, payload jsonb)
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.push_outbox o where o.created_at < now() - interval '7 days';
  return query
    with c as (
      update public.push_outbox o set sent_at = now()
      where o.sent_at is null and o.created_at > now() - interval '1 hour'
      returning o.id, o.user_id, o.sid, o.kind, o.title, o.body)
    select c.id, s.endpoint, s.p256dh, s.auth,
      jsonb_build_object('title', c.title, 'body', c.body, 'sid', c.sid, 'tag', c.kind || '-' || coalesce(c.sid::text, '') || '-' || c.id)
    from c join public.push_subscriptions s on s.user_id = c.user_id;
end;
$$;
revoke all on function public.push_vapid(), public.push_vapid_set(jsonb), public.push_claim() from public, anon, authenticated;
grant execute on function public.push_vapid(), public.push_vapid_set(jsonb), public.push_claim() to service_role;
