-- Add new columns to products table for stock alerts and product status
ALTER TABLE public.products 
ADD COLUMN alert_stock integer DEFAULT 10,
ADD COLUMN is_active boolean DEFAULT true;

-- Add index for better performance when filtering active products
CREATE INDEX idx_products_is_active ON public.products(is_active);

-- Add index for stock alerts queries
CREATE INDEX idx_products_stock_alert ON public.products(stock, alert_stock) WHERE is_active = true;