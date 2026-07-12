-- "Dilek ve Öneri" sayfasından gelen kullanıcı geri bildirimleri. Giriş yapmadan
-- da gönderilebilir (user_id nullable), giriş yapmışsa hesaba bağlanır.
CREATE TABLE IF NOT EXISTS feedback_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'oneri',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_feedback_category'
  ) THEN
    ALTER TABLE feedback_messages
      ADD CONSTRAINT chk_feedback_category
      CHECK (category IN ('oneri', 'hata', 'diger'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback_messages (created_at DESC);
