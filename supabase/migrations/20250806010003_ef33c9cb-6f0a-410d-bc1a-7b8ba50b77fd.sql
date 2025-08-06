-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all categories" 
ON public.categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add category_id to products table
ALTER TABLE public.products 
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Create index for better performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_categories_active ON public.categories(is_active);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get top categories by sales volume
CREATE OR REPLACE FUNCTION public.get_top_categories_by_sales(limit_count integer DEFAULT 10)
RETURNS TABLE(
  category_id uuid,
  category_name text,
  total_quantity bigint,
  total_revenue numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    c.id as category_id,
    c.name as category_name,
    COALESCE(SUM(si.quantity), 0) as total_quantity,
    COALESCE(SUM(si.subtotal), 0) as total_revenue
  FROM public.categories c
  LEFT JOIN public.products p ON p.category_id = c.id
  LEFT JOIN public.sale_items si ON si.product_id = p.id
  WHERE c.is_active = true
  GROUP BY c.id, c.name
  ORDER BY total_quantity DESC, total_revenue DESC
  LIMIT limit_count;
$$;

-- Function to check products with inactive categories
CREATE OR REPLACE FUNCTION public.get_products_with_inactive_categories()
RETURNS TABLE(
  product_id uuid,
  product_name text,
  category_id uuid,
  category_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.id as product_id,
    p.name as product_name,
    c.id as category_id,
    c.name as category_name
  FROM public.products p
  JOIN public.categories c ON p.category_id = c.id
  WHERE c.is_active = false;
$$;