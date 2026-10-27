-- Trener nå: vennene ser en manual på deg når du har en økt i gang.
-- Appen sier fra når du krysser av første sett, fornyer det mens du krysser av, og sier fra når økta er ferdig,
-- hoppet over eller slettet. Serveren glemmer det to timer etter siste gang, i tilfelle økta blir liggende.
-- Samme bryter som Aktiv nå. Er den av, lagres ingenting, og det som var lagret, slettes.
-- Vennene får bare vite status nå: 'train' (trener) eller 'live' (har Sammen åpen). Trener vinner.

alter table public.presence add column training_at timestamptz;

create function public.presence_train(training boolean) returns void
language sql security definer set search_path = '' as $$
  insert into public.presence (user_id, training_at)
  select auth.uid(), case when training then now() end where auth.uid() is not null
  on conflict (user_id) do update set training_at = case when public.presence.hidden then null else excluded.training_at end;
$$;

create or replace function public.presence_show(show boolean) returns void
language sql security definer set search_path = '' as $$
  insert into public.presence (user_id, hidden, active_at, training_at)
  select auth.uid(), not show, null, null where auth.uid() is not null
  on conflict (user_id) do update set hidden = excluded.hidden,
    active_at = case when excluded.hidden then null else public.presence.active_at end,
    training_at = case when excluded.hidden then null else public.presence.training_at end;
$$;

drop function public.presence_now();
create function public.presence_now() returns table (user_id uuid, state text)
language sql stable security definer set search_path = '' as $$
  select p.user_id, case when p.training_at > now() - interval '2 hours' then 'train' else 'live' end
  from public.presence p
  where not p.hidden and private.is_friend(p.user_id)
    and (p.training_at > now() - interval '2 hours' or p.active_at > now() - interval '2 minutes');
$$;

revoke all on function public.presence_train(boolean), public.presence_now() from public, anon;
grant execute on function public.presence_train(boolean), public.presence_now() to authenticated;
