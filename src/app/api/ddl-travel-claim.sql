-- Run this SQL in your Supabase SQL editor
create table if not exists public.tarvelclaimform (
  id uuid primary key,
  created_at timestamptz default now(),
  full_name text,
  policy_no text,
  passport_no text,
  destination_country text,
  phone text,
  email text,
  departure_date date,
  return_date date,
  airline text,
  claim_types text,
  other_claim_detail text,
  incident_datetime timestamptz,
  incident_location text,
  incident_description text,
  bank_name text,
  account_no text,
  account_name text,
  declaration boolean default false,
  signature_date date,
  passport_copy_paths text[] default '{}',
  medical_receipts_paths text[] default '{}',
  police_report_path text,
  other_docs_paths text[] default '{}',
  signature_file_path text
);

-- Create a private bucket for uploaded files (run once)
-- select storage.create_bucket('travel-claims', true, 'private');
