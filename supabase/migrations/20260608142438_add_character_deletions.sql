create table public.character_deletions (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null,
  deleted_at timestamptz not null default now(),
  primary key (user_id, character_id)
);

alter table public.character_deletions enable row level security;

create policy "Users can read their own character deletions"
  on public.character_deletions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own character deletions"
  on public.character_deletions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own character deletions"
  on public.character_deletions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own character deletions"
  on public.character_deletions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.character_deletions to authenticated;
revoke all on table public.character_deletions from anon;
