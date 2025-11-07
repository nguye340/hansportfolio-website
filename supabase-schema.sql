-- Project Images Table
-- Run this in your Supabase SQL Editor if you haven't already

-- Create table
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  storage_path text not null,
  alt text,
  sort int default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.project_images enable row level security;

-- Public read policy
create policy "pi_read_public"
on public.project_images
for select
to public
using (true);

-- Admin-only write policy
create policy "pi_write_admin_only"
on public.project_images
for all
to authenticated
using ( auth.jwt()->'user_metadata'->>'role' = 'admin' )
with check ( auth.jwt()->'user_metadata'->>'role' = 'admin' );

-- Storage bucket policies (if not already set)
-- Go to Storage > project-media > Policies

-- Read policy (for signed URLs):
-- Policy name: public_read
-- SELECT operation
-- Target roles: public
-- USING expression: true

-- Write policy (admin only):
-- Policy name: admin_write
-- INSERT, UPDATE, DELETE operations
-- Target roles: authenticated
-- USING expression: (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
-- WITH CHECK expression: (auth.jwt() -> 'user_metadata' ->> 'role'::text) = 'admin'::text
