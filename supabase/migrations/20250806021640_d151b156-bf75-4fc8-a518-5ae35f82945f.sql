-- Update existing sales to have the admin user as seller
UPDATE sales 
SET seller_id = '2c091ced-3511-4dd0-8d14-326010057c0c'
WHERE seller_id IS NULL;