create table if not exists public.user_certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  cert_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, cert_id)
);

alter table public.user_certificates enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'user_certificates' and policyname = 'Users can manage own certs'
  ) then
    create policy "Users can manage own certs" on public.user_certificates
      for all using (auth.uid() = user_id);
  end if;
end $$;
