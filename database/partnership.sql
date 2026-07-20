-- VELIZO Partnership Requests Table
-- Run this in your Supabase SQL Editor

create table if not exists public.partnership_requests (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  registration_number text not null,
  country text not null,
  industry text not null,
  company_size text not null,
  website text,
  hiring_description text not null,
  contact_name text not null,
  contact_title text not null,
  contact_email text not null,
  contact_phone text not null,
  logo_file_url text,
  registration_cert_url text,
  tax_document_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.partnership_requests enable row level security;

-- Allow anyone to insert (public form submission)
create policy "Allow public to submit partnership requests"
  on public.partnership_requests for insert
  with check (true);

-- Only admins can read/update (handled via service role in backend)
create policy "Allow admin to manage partnership requests"
  on public.partnership_requests for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
