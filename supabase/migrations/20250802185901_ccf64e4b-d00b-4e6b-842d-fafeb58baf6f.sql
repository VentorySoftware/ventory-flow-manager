-- Create a default admin user profile and role (you'll need to sign up with this email)
-- This is just a placeholder - when you sign up with admin@ventory.com, 
-- the trigger will create the profile and assign the default 'user' role.
-- Then manually update the role to 'admin' in the database or through the interface.

-- Insert an initial admin role assignment that will be used when someone signs up
-- with the admin email (this is just a reference for documentation)
INSERT INTO public.user_roles (user_id, role) 
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Placeholder UUID
  'admin'
) ON CONFLICT DO NOTHING;

-- Clean up the placeholder record
DELETE FROM public.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000000';