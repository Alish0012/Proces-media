-- Hangi ödeme sağlayıcısıyla (shopier/iyzico) oluşturulduğunu kayıt altına alır —
-- destek/muhasebe için faydalı, sipariş oluşturulduğu anda yazılır.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider TEXT;
