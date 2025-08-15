-- Fix RLS policies for user management

-- First, update the profiles table RLS policies to allow admins to manage all profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies that allow admins to manage all profiles
CREATE POLICY "Users can insert their own profile or admins can insert any profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own profile or admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Add delete policy for admins
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update user_roles policies to prevent duplicate key errors
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create more specific policies for user_roles
CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add unique constraint if not exists to prevent duplicate user_role combinations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_role'
    ) THEN
        ALTER TABLE public.user_roles 
        ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);
    END IF;
END $$;