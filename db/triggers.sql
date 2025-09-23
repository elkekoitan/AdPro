-- This trigger creates a new row in public.user_profiles when a new user signs up.
-- It copies the first_name and last_name from the user's metadata.
-- Please apply this trigger to your Supabase database in the SQL Editor.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, first_name, last_name, display_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
