-- Samme økt eller egen: eieren deler programøkta si på timen (øvelser, reps og andel av 1RM, ikke vektene).
-- Hver som blir med velger selv om de kjører den samme økta med egne vekter, eller sin egen.
alter table public.sessions add column plan jsonb;
grant update (plan) on public.sessions to authenticated;

alter table public.participants add column plan text not null default 'own' check (plan in ('same', 'own'));
grant update (plan) on public.participants to authenticated;
create policy "påmelding: velg økt" on public.participants for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
