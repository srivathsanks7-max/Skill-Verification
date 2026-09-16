-- Create the profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  username text,
  full_name text,
  avatar_url text,
  github_stats jsonb,
  skills text[]
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);
