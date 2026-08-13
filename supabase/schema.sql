-- Run this in Supabase Dashboard > SQL Editor.
-- In Authentication > Providers, enable "Anonymous sign-ins" before using the app.

create table if not exists public.shared_locations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy real,
  updated_at timestamptz not null default now()
);

alter table public.shared_locations enable row level security;

create policy "Signed-in users can see shared locations"
  on public.shared_locations for select to authenticated using (true);

create policy "Users can add only their location"
  on public.shared_locations for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update only their location"
  on public.shared_locations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove only their location"
  on public.shared_locations for delete to authenticated
  using ((select auth.uid()) = user_id);

alter table public.shared_locations replica identity full;
alter publication supabase_realtime add table public.shared_locations;
