-- Add seller/user field to sales table
ALTER TABLE public.sales ADD COLUMN seller_id uuid REFERENCES auth.users(id);

-- Update existing sales to have a seller_id (you can set this to a default admin user or leave as NULL)
-- For now, we'll leave them as NULL to represent legacy sales