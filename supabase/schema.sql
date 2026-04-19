-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop old tables if they exist
drop table if exists action_recommendation cascade;
drop table if exists risk_level cascade;
drop table if exists symptoms cascade;
drop table if exists session_time cascade;
drop table if exists users cascade;

-- Consolidated Single Table: symptom_logs
create table symptom_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  symptom_text text not null,
  risk_level text not null,
  recommendation text not null,
  trigger_words text[] default '{}',
  session_start timestamp with time zone,
  session_end timestamp with time zone,
  duration_minutes integer,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table symptom_logs enable row level security;

-- Policies for symptom_logs
create policy "Users can view their own logs"
on symptom_logs for select
using (auth.uid() = user_id);

create policy "Users can insert their own logs"
on symptom_logs for insert
with check (auth.uid() = user_id);

create policy "Users can update their own logs"
on symptom_logs for update
using (auth.uid() = user_id);

create policy "Users can delete their own logs"
on symptom_logs for delete
using (auth.uid() = user_id);
