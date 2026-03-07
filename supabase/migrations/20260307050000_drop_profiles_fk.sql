-- Drop the foreign key constraint linking profiles.id to auth.users
-- This allows guest users (with random UUIDs) to create profiles
ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
