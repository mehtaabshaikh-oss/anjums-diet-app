-- ===== Anjum's Diet & Wellness Database Schema =====
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===== USERS (extends Supabase auth.users) =====
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- Disable RLS on users table - API authentication handles access control
-- alter table public.users enable row level security;

-- NOTE: Commented out RLS policies to avoid infinite recursion in subqueries
-- create policy "Users can read own data" on public.users
--   for select using (auth.uid() = id);

-- create policy "Admins can read all users" on public.users
--   for select using (
--     exists (select 1 from public.users where id = auth.uid() and role = 'admin')
--   );

-- create policy "Admins can insert users" on public.users
--   for insert with check (
--     exists (select 1 from public.users where id = auth.uid() and role = 'admin')
--   );

-- create policy "Admins can update users" on public.users
--   for update using (
--     exists (select 1 from public.users where id = auth.uid() and role = 'admin')
--   );

-- ===== LEADS =====
create table public.leads (
  id bigint generated always as identity primary key,
  name text not null,
  email text,
  phone text,
  message text,
  source text not null default 'contact_form' check (source in ('contact_form', 'walkin', 'whatsapp', 'email', 'phone_call', 'referral', 'social_media', 'other')),
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'rejected')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- All authenticated users can view leads
create policy "Authenticated users can view leads" on public.leads
  for select using (auth.role() = 'authenticated');

-- All authenticated users can insert leads (for contact form via API)
create policy "Anyone can insert leads" on public.leads
  for insert with check (true);

-- All authenticated users can update leads
create policy "Authenticated users can update leads" on public.leads
  for update using (auth.role() = 'authenticated');

-- Only admins can delete leads
create policy "Admins can delete leads" on public.leads
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ===== CLIENTS =====
create table public.clients (
  id bigint generated always as identity primary key,
  lead_id bigint references public.leads(id) on delete set null,
  name text not null,
  email text,
  phone text,
  package text not null check (package in ('gold', 'hybrid', 'platinum')),
  duration_months int not null check (duration_months in (3, 6, 9, 12)),
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'paused', 'cancelled')),
  nutritionist text default 'anjum' check (nutritionist in ('anjum', 'nutritionist_1', 'nutritionist_2', 'nutritionist_3')),
  password_hash text,
  password_changed boolean default false,
  last_login timestamptz,
  next_appointment_date timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Authenticated users can view clients" on public.clients
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert clients" on public.clients
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update clients" on public.clients
  for update using (auth.role() = 'authenticated');

create policy "Admins can delete clients" on public.clients
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ===== CLIENT PROFILES =====
create table public.client_profiles (
  id bigint generated always as identity primary key,
  client_id bigint references public.clients(id) on delete cascade not null unique,
  age int,
  gender text check (gender in ('male', 'female', 'other')),
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  target_weight_kg numeric(5,1),
  chest_cm numeric(5,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  thigh_cm numeric(5,1),
  allergies text,
  medical_conditions text,
  dietary_preference text check (dietary_preference in ('veg', 'non-veg', 'eggetarian', 'vegan')),
  food_dislikes text,
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active')),
  notes text
);

alter table public.client_profiles enable row level security;

create policy "Authenticated users can view profiles" on public.client_profiles
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert profiles" on public.client_profiles
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update profiles" on public.client_profiles
  for update using (auth.role() = 'authenticated');

-- ===== WEIGHT LOGS =====
create table public.weight_logs (
  id bigint generated always as identity primary key,
  client_id bigint references public.clients(id) on delete cascade not null,
  weight_kg numeric(5,1) not null,
  logged_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.weight_logs enable row level security;

create policy "Authenticated users can view weight logs" on public.weight_logs
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert weight logs" on public.weight_logs
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update weight logs" on public.weight_logs
  for update using (auth.role() = 'authenticated');

create policy "Admins can delete weight logs" on public.weight_logs
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ===== MEASUREMENTS LOGS =====
create table public.measurements_logs (
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

alter table public.measurements_logs enable row level security;

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

-- ===== PAYMENTS =====
create table public.payments (
  id bigint generated always as identity primary key,
  client_id bigint references public.clients(id) on delete cascade not null,
  amount numeric(10,2) not null,
  date date not null default current_date,
  method text not null check (method in ('cash', 'credit_card', 'check', 'upi', 'bank_transfer')),
  status text not null default 'paid' check (status in ('paid', 'pending', 'partial')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Only admins can access payments
create policy "Admins can view payments" on public.payments
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert payments" on public.payments
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update payments" on public.payments
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete payments" on public.payments
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ===== NOTES =====
create table public.notes (
  id bigint generated always as identity primary key,
  client_id bigint references public.clients(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Authenticated users can view notes" on public.notes
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert notes" on public.notes
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can delete notes" on public.notes
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ===== DIET PLANS =====
create table public.diet_plans (
  id bigint generated always as identity primary key,
  client_id bigint references public.clients(id) on delete cascade not null,
  name text not null,
  description text,
  active boolean default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

alter table public.diet_plans enable row level security;

-- Authenticated users can view diet plans
create policy "Authenticated users can view diet plans" on public.diet_plans
  for select using (auth.role() = 'authenticated');

-- Authenticated users can insert diet plans
create policy "Authenticated users can insert diet plans" on public.diet_plans
  for insert with check (auth.role() = 'authenticated');

-- Authenticated users can update diet plans
create policy "Authenticated users can update diet plans" on public.diet_plans
  for update using (auth.role() = 'authenticated');

-- Only admins can delete diet plans
create policy "Admins can delete diet plans" on public.diet_plans
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ===== DIET PLAN ITEMS =====
create table public.diet_plan_items (
  id bigint generated always as identity primary key,
  diet_plan_id bigint references public.diet_plans(id) on delete cascade not null,
  meal_type text not null check (meal_type in ('breakfast', 'brunch', 'lunch', 'snack', 'dinner', 'supper')),
  sequence int not null,
  item_name text not null,
  quantity numeric(8,2) not null,
  unit text not null,
  time text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.diet_plan_items enable row level security;

-- Authenticated users can view diet plan items
create policy "Authenticated users can view diet plan items" on public.diet_plan_items
  for select using (auth.role() = 'authenticated');

-- Authenticated users can insert diet plan items
create policy "Authenticated users can insert diet plan items" on public.diet_plan_items
  for insert with check (auth.role() = 'authenticated');

-- Authenticated users can update diet plan items
create policy "Authenticated users can update diet plan items" on public.diet_plan_items
  for update using (auth.role() = 'authenticated');

-- Only admins can delete diet plan items
create policy "Admins can delete diet plan items" on public.diet_plan_items
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ===== DIET LOGS =====
create table public.diet_logs (
  id bigint generated always as identity primary key,
  client_id bigint references public.clients(id) on delete cascade not null,
  logged_date date not null,
  submitted_at timestamptz,
  status text not null default 'not_submitted' check (status in ('submitted', 'not_submitted')),
  created_at timestamptz not null default now()
);

alter table public.diet_logs enable row level security;

-- Authenticated users (admin/staff) can view all diet logs
create policy "Authenticated users can view diet logs" on public.diet_logs
  for select using (auth.role() = 'authenticated');

-- Authenticated users (admin/staff) can insert diet logs
create policy "Authenticated users can insert diet logs" on public.diet_logs
  for insert with check (auth.role() = 'authenticated');

-- Authenticated users (admin/staff) can update diet logs
create policy "Authenticated users can update diet logs" on public.diet_logs
  for update using (auth.role() = 'authenticated');

-- Only admins can delete diet logs
create policy "Admins can delete diet logs" on public.diet_logs
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ===== DIET LOG ITEMS =====
create table public.diet_log_items (
  id bigint generated always as identity primary key,
  diet_log_id bigint references public.diet_logs(id) on delete cascade not null,
  diet_plan_item_id bigint references public.diet_plan_items(id) on delete cascade not null,
  completed boolean default false,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

alter table public.diet_log_items enable row level security;

-- Authenticated users (admin/staff) can view all diet log items
create policy "Authenticated users can view diet log items" on public.diet_log_items
  for select using (auth.role() = 'authenticated');

-- Authenticated users (admin/staff) can insert diet log items
create policy "Authenticated users can insert diet log items" on public.diet_log_items
  for insert with check (auth.role() = 'authenticated');

-- Authenticated users (admin/staff) can update diet log items
create policy "Authenticated users can update diet log items" on public.diet_log_items
  for update using (auth.role() = 'authenticated');

-- Only admins can delete diet log items
create policy "Admins can delete diet log items" on public.diet_log_items
  for delete using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
