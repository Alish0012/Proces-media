-- iyzico, ödeme hiç tamamlanmadan (kart girilmeden) callback'e düşen token'lar için
-- retrieve yanıtında conversationId'yi geri döndürmüyor — bu durumda hangi
-- siparişin bu olduğunu bulabilmek için token'ı kendimiz saklıyoruz.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS iyzico_token TEXT;
