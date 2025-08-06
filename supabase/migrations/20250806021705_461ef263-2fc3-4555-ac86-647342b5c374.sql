-- Update existing sales to have the admin user as seller
UPDATE sales 
SET seller_id = '2c091ced-3511-4dd0-8d14-32601057c0c7'
WHERE seller_id IS NULL;