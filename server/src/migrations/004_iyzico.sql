-- Shopier'dan iyzico'ya geçiş: iyzico ödeme formu, dolandırıcılık kontrolü için
-- alıcının TC Kimlik No ve telefon bilgisini zorunlu kılıyor — bu bilgi ödeme
-- adımında bir kere sorulup hesaba kaydedilir, sonraki alımlarda tekrar sorulmaz.
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- orders.shopier_order_id artık ödeme sağlayıcısından bağımsız bir isimle
-- (psp_reference) kullanılıyor — iyzico'nun paymentId'si burada saklanacak.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shopier_order_id'
  ) THEN
    ALTER TABLE orders RENAME COLUMN shopier_order_id TO psp_reference;
  END IF;
END $$;
