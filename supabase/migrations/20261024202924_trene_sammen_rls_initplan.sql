-- Samme regler som før, men auth.uid() regnes ut én gang per spørring i stedet for per rad
create index if not exists proposals_user on public.proposals (user_id);

alter policy "profil: lag egen" on public.profiles with check (id = (select auth.uid()));
alter policy "profil: endre egen" on public.profiles using (id = (select auth.uid())) with check (id = (select auth.uid()));
alter policy "sett: egen" on public.seen using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "venn: les egne" on public.friendships using (requester = (select auth.uid()) or addressee = (select auth.uid()));
alter policy "venn: send forespørsel" on public.friendships with check (requester = (select auth.uid()) and status = 'pending' and accepted_at is null);
alter policy "venn: godta" on public.friendships using (addressee = (select auth.uid()) and status = 'pending') with check (addressee = (select auth.uid()) and status = 'accepted');
alter policy "venn: fjern" on public.friendships using (requester = (select auth.uid()) or addressee = (select auth.uid()));
alter policy "time: les egne og venners" on public.sessions using (owner = (select auth.uid()) or private.is_friend(owner));
alter policy "time: lag egen" on public.sessions with check (owner = (select auth.uid()) and cancelled_at is null);
alter policy "time: endre egen" on public.sessions using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
alter policy "time: slett egen" on public.sessions using (owner = (select auth.uid()));
alter policy "påmelding: meld på deg selv" on public.participants with check (user_id = (select auth.uid()) and exists (
    select 1 from public.sessions s
    where s.id = session_id and s.kind = 'fixed' and s.cancelled_at is null
      and s.owner <> (select auth.uid()) and private.is_friend(s.owner)));
alter policy "påmelding: meld av deg selv" on public.participants using (user_id = (select auth.uid()));
alter policy "forslag: foreslå selv" on public.proposals with check (user_id = (select auth.uid()) and exists (
    select 1 from public.sessions s
    where s.id = session_id and s.kind = 'window' and s.cancelled_at is null
      and s.owner <> (select auth.uid()) and private.is_friend(s.owner)
      and proposed_at between s.starts_at and s.ends_at));
alter policy "forslag: trekk eget" on public.proposals using (user_id = (select auth.uid()));
