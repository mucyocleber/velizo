-- VELIZO Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends Supabase Auth users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null unique,
    full_name text not null,
    role text not null check (role in ('candidate', 'employer', 'agency', 'admin')),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 2. CANDIDATES TABLE
create table if not exists public.candidates (
    id uuid references public.profiles(id) on delete cascade primary key,
    nationality text,
    current_location text,
    summary text,
    preferred_countries text[], -- Array of countries
    preferred_job_categories text[], -- Array of categories
    phone_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.candidates enable row level security;

-- 3. COMPANY PROFILES (For Employers)
create table if not exists public.company_profiles (
    id uuid default gen_random_uuid() primary key,
    employer_id uuid references public.profiles(id) on delete cascade not null unique,
    company_name text not null,
    logo_url text,
    website text,
    industry text,
    company_size text,
    description text,
    country text not null,
    city text,
    address text,
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.company_profiles enable row level security;

-- 4. CAREER PASSPORTS
create table if not exists public.career_passports (
    id uuid default gen_random_uuid() primary key,
    candidate_id uuid references public.profiles(id) on delete cascade not null unique,
    career_score integer default 0,
    trust_score integer default 0,
    identity_verified boolean default false,
    education_verified boolean default false,
    employment_verified boolean default false,
    skills_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.career_passports enable row level security;

-- 5. EDUCATION RECORDS
create table if not exists public.education_records (
    id uuid default gen_random_uuid() primary key,
    candidate_id uuid references public.profiles(id) on delete cascade not null,
    school_name text not null,
    degree text not null,
    field_of_study text,
    start_date date not null,
    end_date date,
    is_current boolean default false,
    description text,
    certificate_url text, -- Verification document
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.education_records enable row level security;

-- 6. EMPLOYMENT HISTORY
create table if not exists public.employment_history (
    id uuid default gen_random_uuid() primary key,
    candidate_id uuid references public.profiles(id) on delete cascade not null,
    company_name text not null,
    job_title text not null,
    start_date date not null,
    end_date date,
    is_current boolean default false,
    description text,
    employment_proof_url text, -- Payslip, contract, reference letter
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.employment_history enable row level security;

-- 7. SKILLS
create table if not exists public.skills (
    id uuid default gen_random_uuid() primary key,
    candidate_id uuid references public.profiles(id) on delete cascade not null,
    skill_name text not null,
    proficiency_level text check (proficiency_level in ('beginner', 'intermediate', 'expert')),
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(candidate_id, skill_name)
);

alter table public.skills enable row level security;

-- 8. CERTIFICATIONS
create table if not exists public.certifications (
    id uuid default gen_random_uuid() primary key,
    candidate_id uuid references public.profiles(id) on delete cascade not null,
    certification_name text not null,
    issuing_organization text not null,
    issue_date date,
    expiration_date date,
    credential_id text,
    credential_url text,
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.certifications enable row level security;

-- 9. JOBS TABLE
create table if not exists public.jobs (
    id uuid default gen_random_uuid() primary key,
    employer_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    category text not null,
    employment_type text not null check (employment_type in ('full-time', 'part-time', 'contract', 'internship')),
    experience_level text not null check (experience_level in ('entry', 'mid', 'senior', 'lead')),
    salary_min numeric,
    salary_max numeric,
    currency text default 'USD',
    country text not null,
    city text,
    remote_type text check (remote_type in ('on-site', 'hybrid', 'remote')),
    description text not null,
    requirements text[],
    benefits text[],
    status text default 'draft' check (status in ('draft', 'published', 'closed', 'archived')),
    application_deadline date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.jobs enable row level security;

-- 10. JOB APPLICATIONS
create table if not exists public.job_applications (
    id uuid default gen_random_uuid() primary key,
    job_id uuid references public.jobs(id) on delete cascade not null,
    candidate_id uuid references public.profiles(id) on delete cascade not null,
    resume_url text not null,
    cover_letter text,
    status text default 'submitted' check (status in ('submitted', 'reviewing', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn')),
    employer_feedback text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(job_id, candidate_id)
);

alter table public.job_applications enable row level security;

-- 11. NOTIFICATIONS
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    content text not null,
    type text not null, -- e.g., 'application_update', 'message', 'job_alert'
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

-- 12. MESSAGES
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    message_text text not null,
    file_attachment_url text,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

-- 13. SUBSCRIPTIONS
create table if not exists public.subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null unique,
    plan_name text not null check (plan_name in ('free', 'premium_candidate', 'employer_standard', 'employer_premium', 'agency')),
    status text not null check (status in ('active', 'past_due', 'canceled', 'incomplete')),
    stripe_subscription_id text,
    stripe_customer_id text,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ────────────────────

-- Profile Policies
create policy "Allow public read of profiles" on public.profiles for select using (true);
create policy "Allow users to update own profile" on public.profiles for update using (auth.uid() = id);

-- Candidate Policies
create policy "Allow public read of candidates" on public.candidates for select using (true);
create policy "Allow candidates to insert/update own profile" on public.candidates for all using (auth.uid() = id);

-- Company Profile Policies
create policy "Allow public read of company profiles" on public.company_profiles for select using (true);
create policy "Allow employers to manage own company profile" on public.company_profiles for all using (auth.uid() = employer_id);

-- Career Passport Policies
create policy "Allow public read of career passports" on public.career_passports for select using (true);
create policy "Allow candidates to update own career passport" on public.career_passports for update using (auth.uid() = candidate_id);

-- Education & Employment Policies
create policy "Allow public read of education" on public.education_records for select using (true);
create policy "Allow candidates to manage own education" on public.education_records for all using (auth.uid() = candidate_id);

create policy "Allow public read of employment" on public.employment_history for select using (true);
create policy "Allow candidates to manage own employment" on public.employment_history for all using (auth.uid() = candidate_id);

-- Skills & Certifications Policies
create policy "Allow public read of skills" on public.skills for select using (true);
create policy "Allow candidates to manage own skills" on public.skills for all using (auth.uid() = candidate_id);

create policy "Allow public read of certifications" on public.certifications for select using (true);
create policy "Allow candidates to manage own certifications" on public.certifications for all using (auth.uid() = candidate_id);

-- Job Policies
create policy "Allow public read of published jobs" on public.jobs for select using (status = 'published' or auth.uid() = employer_id);
create policy "Allow employers to manage own jobs" on public.jobs for all using (auth.uid() = employer_id);

-- Job Application Policies
create policy "Allow candidates to see own applications" on public.job_applications for select using (auth.uid() = candidate_id);
create policy "Allow employers to see applications for their jobs" on public.job_applications for select using (
    exists (select 1 from public.jobs where jobs.id = job_applications.job_id and jobs.employer_id = auth.uid())
);
create policy "Allow candidates to apply" on public.job_applications for insert with check (auth.uid() = candidate_id);
create policy "Allow employers to update application status" on public.job_applications for update using (
    exists (select 1 from public.jobs where jobs.id = job_applications.job_id and jobs.employer_id = auth.uid())
);

-- Notification Policies
create policy "Allow users to manage own notifications" on public.notifications for all using (auth.uid() = user_id);

-- Message Policies
create policy "Allow users to see their own messages" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Allow users to send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- Subscription Policies
create policy "Allow users to see own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- ─── TRIGGERS FOR USER REGISTRATION ───────────────────────

-- Create a trigger function that runs when a user is created in auth.users
-- This automatically inserts a corresponding row in public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'candidate')
  );
  
  -- If role is candidate, initialize blank Career Passport and Candidate Profile
  if coalesce(new.raw_user_meta_data->>'role', 'candidate') = 'candidate' then
    insert into public.candidates (id) values (new.id);
    insert into public.career_passports (candidate_id) values (new.id);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
