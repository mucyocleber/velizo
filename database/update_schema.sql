-- VELIZO Database Schema Updates
-- Phase 2: Role Partitioning and Admin Profiles

-- Add check constraint update to public.profiles if needed (to support super_admin)
-- Supabase doesn't easily let us replace constraints, so we drop and recreate if needed, 
-- or we handle it inside our app logic. To be safe, let's alter the table constraint.

-- 1. Create ADMIN PROFILES table
create table if not exists public.admin_profiles (
    id uuid references public.profiles(id) on delete cascade primary key,
    department text,
    access_level text default 'moderator' check (access_level in ('moderator', 'super_admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_profiles enable row level security;

-- Admin profiles RLS Policies
create policy "Allow admins to read all admin profiles" on public.admin_profiles
    for select using (
        exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role in ('admin', 'super_admin'))
    );

create policy "Allow super admins to manage admin profiles" on public.admin_profiles
    for all using (
        exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'super_admin')
    );

-- 2. Update handles_new_user() trigger function to partition super_admin and admin profiles
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'candidate');

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    user_role
  );
  
  -- Create role-specific profile records
  if user_role = 'candidate' then
    insert into public.candidates (id) values (new.id);
    insert into public.career_passports (candidate_id) values (new.id);
  elsif user_role = 'employer' then
    insert into public.company_profiles (employer_id, company_name, country)
    values (new.id, coalesce(new.raw_user_meta_data->>'company_name', 'My Company'), 'Canada');
  elsif user_role in ('admin', 'super_admin') then
    insert into public.admin_profiles (id, access_level)
    values (new.id, user_role);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;
