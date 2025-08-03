-- Add active status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Create index for better performance
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Add email column to profiles table to have email accessible via API
ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- Create function to update profile email from auth user
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Update the profile email when auth user email changes
  UPDATE public.profiles 
  SET email = NEW.email 
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync email from auth.users to profiles
CREATE TRIGGER sync_profile_email_trigger
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email();

-- Update existing profiles with email from auth.users if possible
-- Note: This is a one-time sync for existing data
UPDATE public.profiles 
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = profiles.user_id
)
WHERE email IS NULL;