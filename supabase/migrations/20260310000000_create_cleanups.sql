-- Create cleanups table
-- input_url / output_url store the Supabase Storage object paths so that
-- fresh signed URLs can always be generated (stored signed URLs would expire).
create table if not exists public.cleanups (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade not null,
  status     text        not null default 'pending',
  input_url  text,
  output_url text,
  created_at timestamptz default now()
);

-- Row-level security
alter table public.cleanups enable row level security;

create policy "Users can view own cleanups"
  on public.cleanups for select
  using (auth.uid() = user_id);

create policy "Users can insert own cleanups"
  on public.cleanups for insert
  with check (auth.uid() = user_id);

-- Storage bucket (private — access via signed URLs only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cleanups',
  'cleanups',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload under their own user_id folder
create policy "Users can upload their own cleanup images"
  on storage.objects for insert
  with check (
    bucket_id = 'cleanups'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read only their own cleanup images (required for signed URL generation)
create policy "Users can read their own cleanup images"
  on storage.objects for select
  using (
    bucket_id = 'cleanups'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
