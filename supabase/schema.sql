-- ============================================================
-- Festy App – Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text not null,
  role text not null default 'user' check (role in ('admin', 'sub_admin', 'user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

-- RLS
alter table profiles enable row level security;

create policy "Users can view all profiles"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- FESTIVALS
-- ============================================================
create table if not exists festivals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  start_date date,
  end_date date,
  category text not null default 'Other' check (category in (
    'Kirchweih', 'Music Event', 'Folk Festival', 'Art Performance',
    'Seasonal Market', 'Food & Wine Tasting', 'Parade & Procession',
    'Historical Reenactment', 'Sports Events', 'Beer Festival', 'Other'
  )),
  location text not null,
  description text,
  link text,
  latitude double precision,
  longitude double precision,
  image_url text,
  status text not null default 'upcoming' check (status in ('active', 'upcoming', 'ended')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger festivals_updated_at
  before update on festivals
  for each row execute procedure update_updated_at();

-- RLS
alter table festivals enable row level security;

create policy "Anyone can read festivals"
  on festivals for select using (true);

create policy "Admins can insert festivals"
  on festivals for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'sub_admin')
    )
  );

create policy "Admins can update festivals"
  on festivals for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'sub_admin')
    )
  );

create policy "Admins can delete festivals"
  on festivals for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- ============================================================
-- EXPERIENCES
-- ============================================================
create table if not exists experiences (
  id uuid default uuid_generate_v4() primary key,
  festival_id uuid references festivals on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  join_date timestamptz not null default now(),
  bierbrauer text,
  beer_name text,
  beer_size text check (beer_size in ('0.3L', '0.5L', '1L')),
  beer_price numeric(6,2),
  bratwurst_price numeric(6,2),
  rating smallint check (rating between 1 and 5),
  comment text,
  senf boolean default false,
  ice_cream_price numeric(6,2),
  fahrgeschaefte text[] default '{}',
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger experiences_updated_at
  before update on experiences
  for each row execute procedure update_updated_at();

-- RLS
alter table experiences enable row level security;

create policy "Anyone can read experiences"
  on experiences for select using (true);

create policy "Users can insert their own experiences"
  on experiences for insert with check (auth.uid() = user_id);

create policy "Users can update their own experiences"
  on experiences for update using (auth.uid() = user_id);

create policy "Users can delete their own experiences"
  on experiences for delete using (auth.uid() = user_id);

create policy "Admins can delete any experience"
  on experiences for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists experiences_user_id_idx on experiences(user_id);
create index if not exists experiences_festival_id_idx on experiences(festival_id);
create index if not exists experiences_join_date_idx on experiences(join_date desc);
create index if not exists festivals_status_idx on festivals(status);
create index if not exists festivals_start_date_idx on festivals(start_date);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (optional trigger)
-- Not needed since we do this in onboarding, but useful fallback
-- ============================================================
-- create or replace function handle_new_user()
-- returns trigger as $$
-- begin
--   insert into profiles (id, email, username, role)
--   values (new.id, new.email, split_part(new.email, '@', 1), 'user')
--   on conflict (id) do nothing;
--   return new;
-- end;
-- $$ language plpgsql security definer;
--
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure handle_new_user();
