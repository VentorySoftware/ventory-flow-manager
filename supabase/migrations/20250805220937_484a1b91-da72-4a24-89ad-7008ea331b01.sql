-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create policies for product images bucket
CREATE POLICY "Anyone can view product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Add image fields to products table
ALTER TABLE public.products 
ADD COLUMN image_urls text[] DEFAULT '{}',
ADD COLUMN primary_image_url text;

-- Update existing products to have empty image arrays
UPDATE public.products SET image_urls = '{}' WHERE image_urls IS NULL;