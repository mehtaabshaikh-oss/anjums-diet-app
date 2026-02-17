-- Add measurements_logs table for tracking body measurement history
-- This migration adds historical tracking of body measurements (chest, waist, hip, thigh)

create table if not exists public.measurements_logs (
  id bigint generated always as identity primary key,
  client_id bigint references public.clients(id) on delete cascade not null,
  chest_cm numeric(5,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  thigh_cm numeric(5,1),
  logged_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- Enable RLS on measurements_logs
alter table public.measurements_logs enable row level security;

-- RLS Policies for measurements_logs
create policy "Authenticated users can view measurements logs" on public.measurements_logs
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert measurements logs" on public.measurements_logs
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update measurements logs" on public.measurements_logs
  for update using (auth.role() = 'authenticated');

create policy "Admins can delete measurements logs" on public.measurements_logs
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
