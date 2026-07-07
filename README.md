# Proces Media

Kayıt/giriş yapılabilen, eklenti (plugin) satışı yapan, bol animasyonlu full-stack web sitesi.

- `server/` — Express + PostgreSQL API (auth, ürünler, siparişler, Shopier entegrasyonu, korumalı indirme)
- `web/` — Next.js (App Router) + Tailwind + Framer Motion frontend

## Kurulum

### 1. PostgreSQL

Yerel bir PostgreSQL sunucusu çalıştırıp `procesmedia` adında bir veritabanı oluşturun:

```
createdb procesmedia
```

### 2. Server

```
cd server
npm install
copy .env.example .env    # sonra .env dosyasını doldurun
npm run migrate           # tabloları oluşturur
npm run seed              # örnek bir ürün ekler (opsiyonel)
npm run dev                # http://localhost:4000
```

`.env` içinde doldurmanız gerekenler:
- `DATABASE_URL` — **admin** bağlantısı, SADECE `npm run migrate` / `npm run seed` kullanır (şema değiştirme yetkisi ister)
- `APP_DATABASE_URL` — sunucu çalışırken kullanılan, kısıtlı yetkili `procesmedia_app` rolünün bağlantısı (bkz. aşağıdaki "Veritabanı güvenliği")
- `JWT_SECRET` — en az 32 karakter rastgele bir string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` ile üretin) — kısa/tahmin edilebilir bir değerle sunucu açılışta hata verir
- `SMTP_*` — şifre sıfırlama e-postalarını göndermek için (ör. Gmail uygulama şifresi)
- `SHOPIER_API_KEY` / `SHOPIER_API_SECRET` / `SHOPIER_WEBSITE_INDEX` — Shopier mağaza panelinizden alınır

## Veritabanı güvenliği

Uygulama, `postgres` süper kullanıcısıyla DEĞİL, sadece gerekli tablolarda okuma/yazma yetkisi olan
kısıtlı bir rolle (`procesmedia_app`) çalışır — şema değiştirme (CREATE TABLE vb.), yeni rol oluşturma
gibi yetkileri yoktur. Bu rolü kendi ortamınızda oluşturmak için (bir kere, admin olarak):

```sql
CREATE ROLE procesmedia_app WITH LOGIN PASSWORD 'güçlü-rastgele-bir-şifre';
GRANT CONNECT ON DATABASE procesmedia TO procesmedia_app;
GRANT USAGE ON SCHEMA public TO procesmedia_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO procesmedia_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO procesmedia_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO procesmedia_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO procesmedia_app;
REVOKE CREATE ON SCHEMA public FROM procesmedia_app;
ALTER ROLE procesmedia_app NOSUPERUSER NOCREATEDB NOCREATEROLE;
```

Bu şifreyi `APP_DATABASE_URL` içine yazın. `pg_hba.conf` dosyasında tüm bağlantılar için
`scram-sha-256` kullanıldığından (asla `trust` değil) emin olun; kurulumdaki `.env` ve şifreler
`.gitignore` ile versiyon kontrolü dışında tutulur, kimseyle paylaşmayın.

### 3. Web

```
cd web
npm install
copy .env.example .env.local
npm run dev                # http://localhost:3000
```

## Ürün ekleme

Şu an ürünler doğrudan veritabanına eklenecek şekilde kurgulandı (admin paneli kapsam dışı bırakıldı).
Yeni bir eklenti eklemek için:

1. Eklentinin dosyalarını `server/uploads/<urun-slug>/` klasörüne koyun.
2. `products` tablosuna bir satır ekleyin (`file_path` = `uploads/<urun-slug>`), örnek: `server/src/seed.js`.

## Ödeme akışı (Shopier)

Kullanıcı sepetten "Shopier ile Öde"ye bastığında `POST /api/orders` bir sipariş (`pending`) oluşturur ve
Shopier ödeme formu alanlarını döner; frontend bu alanlarla otomatik bir form submit ederek kullanıcıyı
Shopier'e yönlendirir. Ödeme sonrası Shopier, mağaza panelinde tanımlayacağınız
`POST /api/shopier/callback` adresine bildirim gönderir; imza doğrulanınca sipariş `paid` olur.

**Önemli:** `server/src/services/shopier.js` içindeki form alanları, yaygın kullanılan Shopier Ödeme
Formu API'sine göre yazıldı. Shopier hesabınızdan API anahtarlarını aldıktan sonra, mağaza panelindeki
güncel API dokümantasyonuyla alan adlarını (özellikle `currency`, `current_language` kodları ve
callback alanları) karşılaştırıp gerekirse güncelleyin.

## İndirme koruması

Satın alınan ürünler kalıcı/genel bir URL üzerinden indirilemez:

1. "İndir" butonu `POST /api/downloads/:productId/token` çağırır → satın alma doğrulanır, 10 dakika
   geçerli, tek kullanımlık bir indirme token'ı üretilir.
2. Token ile `GET /api/downloads/file?token=...` çağrıldığında dosya, alıcının e-posta/sipariş bilgisini
   içeren bir `license.txt` ile birlikte zip olarak indirilir; her indirme IP + zaman ile loglanır.
3. Token bir kez kullanılınca veya süresi dolunca geçersiz olur — kullanıcı tekrar "İndir"e basarak yeni
   bir token alabilir.

## Geliştirme notları

- Auth: JWT (7 gün geçerli), şifreler bcrypt ile hashleniyor.
- Şifre sıfırlama: e-posta ile gönderilen tek kullanımlık, 30 dakika geçerli token.
- Sepet: tarayıcıda localStorage'da tutuluyor (basit, backend'e bağlı değil).
- Güvenlik: `helmet` ile güvenli HTTP başlıkları, `express-rate-limit` ile genel API ve
  özellikle kayıt/giriş/şifre-sıfırlama uçlarında sıkı brute-force koruması, CORS sadece
  `WEB_URL`'e izin verir, indirilen dosya yolu `uploads/` klasörünün dışına çıkamaz
  (path traversal koruması).
- Not (Windows/Türkçe yol): Next.js 16'nın varsayılan derleyicisi Turbopack, proje yolunda
  Türkçe karakter (`Masaüstü` gibi) olduğunda çöküyor (bilinen bir Turbopack hatası). Bu yüzden
  `dev`/`build` script'leri `--webpack` bayrağıyla çalışacak şekilde ayarlandı — projeyi ASCII
  karakterli bir yola taşımadığınız sürece bu bayrağı kaldırmayın.
