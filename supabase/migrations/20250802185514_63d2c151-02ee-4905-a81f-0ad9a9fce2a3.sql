-- Fix security warnings by setting search_path on functions
ALTER FUNCTION public.has_role(_user_id UUID, _role app_role) SET search_path = '';
ALTER FUNCTION public.get_user_role(_user_id UUID) SET search_path = '';