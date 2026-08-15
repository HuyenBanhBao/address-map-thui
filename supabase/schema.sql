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

-- Recipes and their images for the Ngự trù section.
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  category text not null check (category in ('main', 'soup', 'side', 'snack')),
  image_path text,
  prep_minutes integer not null default 15 check (prep_minutes between 1 and 1440),
  rating numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

drop policy if exists "Signed-in users can see recipes" on public.recipes;
create policy "Signed-in users can see recipes"
  on public.recipes for select to authenticated using (true);

drop policy if exists "Signed-in users can add recipes" on public.recipes;
create policy "Signed-in users can add recipes"
  on public.recipes for insert to authenticated
  with check ((select auth.uid()) = created_by);

drop policy if exists "Creators can edit recipes" on public.recipes;
create policy "Creators can edit recipes"
  on public.recipes for update to authenticated
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);

drop policy if exists "Creators can remove recipes" on public.recipes;
create policy "Creators can remove recipes"
  on public.recipes for delete to authenticated
  using ((select auth.uid()) = created_by);

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

drop policy if exists "Signed-in users can see recipe images" on storage.objects;
create policy "Signed-in users can see recipe images"
  on storage.objects for select to authenticated
  using (bucket_id = 'recipe-images');

drop policy if exists "Users can upload their recipe images" on storage.objects;
create policy "Users can upload their recipe images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their recipe images" on storage.objects;
create policy "Users can delete their recipe images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 150),
  quantity text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  instruction text not null check (char_length(instruction) between 1 and 2000),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;

drop policy if exists "Signed-in users can see recipe ingredients" on public.recipe_ingredients;
create policy "Signed-in users can see recipe ingredients"
  on public.recipe_ingredients for select to authenticated using (true);

drop policy if exists "Recipe creators manage ingredients" on public.recipe_ingredients;
create policy "Recipe creators manage ingredients"
  on public.recipe_ingredients for all to authenticated
  using (exists (select 1 from public.recipes where recipes.id = recipe_id and recipes.created_by = (select auth.uid())))
  with check (exists (select 1 from public.recipes where recipes.id = recipe_id and recipes.created_by = (select auth.uid())));

drop policy if exists "Signed-in users can see recipe steps" on public.recipe_steps;
create policy "Signed-in users can see recipe steps"
  on public.recipe_steps for select to authenticated using (true);

drop policy if exists "Recipe creators manage steps" on public.recipe_steps;
create policy "Recipe creators manage steps"
  on public.recipe_steps for all to authenticated
  using (exists (select 1 from public.recipes where recipes.id = recipe_id and recipes.created_by = (select auth.uid())))
  with check (exists (select 1 from public.recipes where recipes.id = recipe_id and recipes.created_by = (select auth.uid())));
