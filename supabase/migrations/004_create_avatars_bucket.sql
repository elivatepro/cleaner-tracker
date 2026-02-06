-- Ensure avatars bucket exists and is public for serving profile images
do $$
begin
  begin
    insert into storage.buckets (id, name, public)
    values ('avatars', 'avatars', true)
    on conflict (id) do update set public = true;
  exception
    when others then
      raise notice 'Skipping avatars bucket creation/update: %', SQLERRM;
  end;

  begin
    alter table if exists storage.objects enable row level security;
  exception
    when others then
      raise notice 'Skipping enable RLS on storage.objects: %', SQLERRM;
  end;

  begin
    if not exists (
      select 1 from pg_policies
      where policyname = 'Public read access for avatars'
        and tablename = 'objects'
        and schemaname = 'storage'
    ) then
      create policy "Public read access for avatars" on storage.objects
        for select
        using (bucket_id = 'avatars');
    end if;
  exception
    when others then
      raise notice 'Skipping read policy for avatars: %', SQLERRM;
  end;

  begin
    if not exists (
      select 1 from pg_policies
      where policyname = 'Users can upload own avatars'
        and tablename = 'objects'
        and schemaname = 'storage'
    ) then
      create policy "Users can upload own avatars" on storage.objects
        for insert to authenticated
        with check (
          bucket_id = 'avatars'
          and auth.uid()::text = substring(name from '^avatars/([0-9a-fA-F-]+)/')
        );
    end if;
  exception
    when others then
      raise notice 'Skipping insert policy for avatars: %', SQLERRM;
  end;

  begin
    if not exists (
      select 1 from pg_policies
      where policyname = 'Users can update own avatars'
        and tablename = 'objects'
        and schemaname = 'storage'
    ) then
      create policy "Users can update own avatars" on storage.objects
        for update to authenticated
        using (
          bucket_id = 'avatars'
          and auth.uid()::text = substring(name from '^avatars/([0-9a-fA-F-]+)/')
        );
    end if;
  exception
    when others then
      raise notice 'Skipping update policy for avatars: %', SQLERRM;
  end;

  begin
    if not exists (
      select 1 from pg_policies
      where policyname = 'Users can delete own avatars'
        and tablename = 'objects'
        and schemaname = 'storage'
    ) then
      create policy "Users can delete own avatars" on storage.objects
        for delete to authenticated
        using (
          bucket_id = 'avatars'
          and auth.uid()::text = substring(name from '^avatars/([0-9a-fA-F-]+)/')
        );
    end if;
  exception
    when others then
      raise notice 'Skipping delete policy for avatars: %', SQLERRM;
  end;
end$$;

-- Public read access to avatar images
do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Public read access for avatars'
      and tablename = 'objects'
      and schemaname = 'storage'
  ) then
    create policy "Public read access for avatars" on storage.objects
      for select
      using (bucket_id = 'avatars');
  end if;
end$$;

-- Authenticated users can upload avatars into their own folder
do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users can upload own avatars'
      and tablename = 'objects'
      and schemaname = 'storage'
  ) then
    create policy "Users can upload own avatars" on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'avatars'
        and auth.uid()::text = (regexp_matches(name, '^avatars/([0-9a-fA-F-]+)/'))[1]
      );
  end if;
end$$;

-- Authenticated users can overwrite images inside their folder (needed for upsert)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users can update own avatars'
      and tablename = 'objects'
      and schemaname = 'storage'
  ) then
    create policy "Users can update own avatars" on storage.objects
      for update to authenticated
      using (
        bucket_id = 'avatars'
        and auth.uid()::text = (regexp_matches(name, '^avatars/([0-9a-fA-F-]+)/'))[1]
      );
  end if;
end$$;

-- Allow users to delete files from their own avatar folder
do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users can delete own avatars'
      and tablename = 'objects'
      and schemaname = 'storage'
  ) then
    create policy "Users can delete own avatars" on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'avatars'
        and auth.uid()::text = (regexp_matches(name, '^avatars/([0-9a-fA-F-]+)/'))[1]
      );
  end if;
end$$;
