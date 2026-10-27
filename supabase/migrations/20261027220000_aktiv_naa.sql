-- Aktiv nå: vennene ser en grønn prikk når du har Sammen åpen på skjermen.
-- Appen sier fra omtrent hvert minutt mens Sammen står åpen, og sier fra når du går ut. Du regnes som aktiv
-- i to minutter etter siste gang. Bryteren «Vis vennene når jeg er i Sammen» er på fra start og gjelder alle
-- telefonene dine. Er den av, lagres ingen tid.
-- Personvern: tabellen kan bare leses av deg selv. Vennene får bare vite hvem som er aktive akkurat nå,
-- aldri tidspunktet, og bare om dere er venner.

create table public.presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  active_at timestamptz,
  hidden boolean not null default false
);
alter table public.presence enable row level security;
revoke all on public.presence from anon, authenticated;
grant select on public.presence to authenticated;
create policy "aktiv: les egen" on public.presence for select to authenticated using (user_id = (select auth.uid()));

-- Fra appen: Sammen er åpen (true) eller lukket (false). Gjør ingenting når bryteren er av.
create function public.presence_ping(active boolean) returns void
language sql security definer set search_path = '' as $$
  insert into public.presence (user_id, active_at)
  select auth.uid(), case when active then now() end where auth.uid() is not null
  on conflict (user_id) do update set active_at = case when public.presence.hidden then null else excluded.active_at end;
$$;

-- Fra appen: bryteren. Slås den av, slettes tiden med en gang.
create function public.presence_show(show boolean) returns void
language sql security definer set search_path = '' as $$
  insert into public.presence (user_id, hidden, active_at)
  select auth.uid(), not show, null where auth.uid() is not null
  on conflict (user_id) do update set hidden = excluded.hidden, active_at = case when excluded.hidden then null else public.presence.active_at end;
$$;

-- Fra appen: vennene dine som har Sammen åpen akkurat nå
create function public.presence_now() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select p.user_id from public.presence p
  where not p.hidden and p.active_at > now() - interval '2 minutes' and private.is_friend(p.user_id);
$$;

revoke all on function public.presence_ping(boolean), public.presence_show(boolean), public.presence_now() from public, anon;
grant execute on function public.presence_ping(boolean), public.presence_show(boolean), public.presence_now() to authenticated;
