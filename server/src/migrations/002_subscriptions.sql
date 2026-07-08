-- Abonelik desteği: bir ürün opsiyonel olarak aylık/yıllık planlarla satılabilir.
-- is_subscription = false olan ürünler (ör. demo-eklenti) hiçbir şekilde etkilenmez.
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS yearly_price NUMERIC(10, 2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_subscription_prices'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT chk_products_subscription_prices
      CHECK (NOT is_subscription OR (monthly_price IS NOT NULL AND yearly_price IS NOT NULL));
  END IF;
END $$;

-- order_items: hangi plan satın alındığı (NULL = tek seferlik satın alma, eski davranış)
-- ve erişimin ne zaman süreceği (NULL = süresiz, eski davranış).
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS billing_period TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_billing_period'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT chk_order_items_billing_period
      CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'yearly'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_expires_at
  ON order_items (product_id, expires_at) WHERE expires_at IS NOT NULL;

-- PM Silence Cutter'ı abonelik ürününe çevir (diğer ürünler etkilenmez).
UPDATE products
SET is_subscription = true, monthly_price = 499.90, yearly_price = 4199.90, price = 499.90
WHERE slug = 'pm-silence-cutter' AND NOT is_subscription;
