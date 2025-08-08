-- Create chat messages table for Venty
CREATE TABLE IF NOT EXISTS public.venty_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and policies
ALTER TABLE public.venty_messages ENABLE ROW LEVEL SECURITY;

-- Policies: users see and insert their own; admins can view all
CREATE POLICY IF NOT EXISTS "Users can view their own venty messages"
ON public.venty_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own venty messages"
ON public.venty_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all venty messages"
ON public.venty_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_venty_messages_user_id_created_at
ON public.venty_messages (user_id, created_at DESC);


-- Create failures log table
CREATE TABLE IF NOT EXISTS public.venty_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  message TEXT NOT NULL,
  error TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.venty_failures ENABLE ROW LEVEL SECURITY;

-- Policies for failures: admins can view all, users can view their own; insert is allowed for own or null (service role bypasses anyway)
CREATE POLICY IF NOT EXISTS "Admins can view all venty failures"
ON public.venty_failures
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY IF NOT EXISTS "Users can view their own venty failures"
ON public.venty_failures
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own venty failures"
ON public.venty_failures
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_venty_failures_user_id_created_at
ON public.venty_failures (user_id, created_at DESC);