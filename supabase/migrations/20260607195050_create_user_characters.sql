create table public.characters (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null,
  character jsonb not null,
  name text not null default 'Unnamed Character',
  race text,
  origin text,
  schema_version integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, character_id),
  constraint characters_character_is_object check (jsonb_typeof(character) = 'object')
);

create index characters_user_updated_at_idx
  on public.characters (user_id, updated_at desc);

alter table public.characters enable row level security;

create policy "Users can read their own characters"
  on public.characters for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own characters"
  on public.characters for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own characters"
  on public.characters for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own characters"
  on public.characters for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.characters to authenticated;
revoke all on table public.characters from anon;
