-- Create missing client_profile records for existing clients without profiles
-- This ensures all clients have profile records that can be populated with health data

insert into public.client_profiles (client_id)
select id from public.clients
where id not in (select distinct client_id from public.client_profiles)
on conflict (client_id) do nothing;
