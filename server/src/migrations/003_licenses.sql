-- Kurulu eklentinin kendi içinde çalışan gerçek lisans kontrolü için: her
-- kullanıcı+ürün çifti için sabit (satın alma tekrarlansa bile değişmeyen)
-- bir lisans anahtarı. Aktiflik kontrolü yine order_items.expires_at üzerinden
-- yapılır — bu tablo sadece "bu anahtar kime ait" eşlemesini tutar.
CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  license_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses (license_key);
