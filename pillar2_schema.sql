-- Create the questions table
create table questions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  language text not null,
  test_cases jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the assessments table
create table assessments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  question_id uuid references questions not null,
  status text check (status in ('passed', 'failed', 'pending')) not null,
  code_submitted text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table questions enable row level security;
alter table assessments enable row level security;

-- Create policies for questions (everyone can view)
create policy "Public questions are viewable by everyone." on questions
  for select using (true);

-- Create policies for assessments (users can view and insert their own)
create policy "Users can view their own assessments." on assessments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own assessments." on assessments
  for insert with check (auth.uid() = user_id);
