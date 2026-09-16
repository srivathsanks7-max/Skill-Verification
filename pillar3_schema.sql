-- Create the credentials table
create table credentials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  assessment_id uuid references assessments not null,
  jwt_token text not null,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table credentials enable row level security;

-- Create policies for credentials
-- Public can view credentials (for verification page)
create policy "Public credentials are viewable by everyone." on credentials
  for select using (true);

-- Only admins/service role can insert credentials (enforced by API)
create policy "Users cannot insert credentials directly." on credentials
  for insert with check (false);
