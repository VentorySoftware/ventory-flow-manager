-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.calculate_product_profit(
  sale_price numeric,
  cost_price numeric,
  quantity numeric
)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT CASE 
    WHEN cost_price = 0 THEN 0
    ELSE (sale_price - cost_price) * quantity
  END;
$function$;

CREATE OR REPLACE FUNCTION public.update_prices_by_percentage(
  product_ids uuid[],
  percentage_increase numeric
)
RETURNS TABLE(updated_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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