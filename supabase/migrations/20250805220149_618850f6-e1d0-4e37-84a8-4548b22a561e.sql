-- Add new fields for inventory management and pricing
ALTER TABLE public.products 
ADD COLUMN cost_price numeric DEFAULT 0,
ADD COLUMN barcode text,
ADD COLUMN weight_unit boolean DEFAULT false;

-- Add index for barcode searches
CREATE INDEX idx_products_barcode ON public.products(barcode) WHERE barcode IS NOT NULL;

-- Update unit field to support weight-based products
-- The unit field will handle: 'unit', 'kg', 'grams', 'lbs'

-- Create a function to calculate profit margins
CREATE OR REPLACE FUNCTION public.calculate_product_profit(
  sale_price numeric,
  cost_price numeric,
  quantity numeric
)
RETURNS numeric
LANGUAGE sql
STABLE
AS $function$
  SELECT CASE 
    WHEN cost_price = 0 THEN 0
    ELSE (sale_price - cost_price) * quantity
  END;
$function$;

-- Create a function for mass price updates
CREATE OR REPLACE FUNCTION public.update_prices_by_percentage(
  product_ids uuid[],
  percentage_increase numeric
)
RETURNS TABLE(updated_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  update_count integer;
BEGIN
  UPDATE public.products 
  SET 
    price = price * (1 + percentage_increase / 100),
    updated_at = now()
  WHERE id = ANY(product_ids);
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  RETURN QUERY SELECT update_count;
END;
$function$;