# Proces Media

Kayıt/giriş yapılabilen, eklenti (plugin) satışı yapan, bol animasyonlu full-stack web sitesi.

- `server/` — Express + PostgreSQL API (auth, ürünler, siparişler, Shopier/iyzico entegrasyonu, korumalı indirme)
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
- `PAYMENT_PROVIDER` — aktif ödeme sağlayıcısı: `shopier` | `iyzico` (`web/.env.local`'daki `NEXT_PUBLIC_PAYMENT_PROVIDER` ile aynı olmalı)
- `SHOPIER_API_KEY` / `SHOPIER_API_SECRET` — Shopier mağaza panelinden ("Geliştirici" bölümü) alınır
- `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` — iyzico mağaza panelinizden alınır (sandbox ve canlı için ayrı ayrı) — onay bekleniyorsa kod hazır kalır, `PAYMENT_PROVIDER=iyzico` yapıldığında devreye girer
- `IYZICO_BASE_URL` — test için `https://sandbox-api.iyzipay.com`, canlıda `https://api.iyzipay.com`

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

## Ödeme akışı (Shopier / iyzico)

İki ödeme sağlayıcısı da kod tabanında hazır bulunur; `PAYMENT_PROVIDER` env değişkeni (`shopier` |
`iyzico`) hangisinin aktif olduğunu belirler — `server/src/routes/orders.js` sipariş oluştururken buna
göre dallanır. Mount edilen route'ların ikisi de (`/api/shopier/callback`, `/api/iyzico/callback`) her
zaman ayakta durur; sadece aktif olmayan sağlayıcının callback'i trafik almaz.

**Shopier (varsayılan):** `POST /api/orders`, Shopier'in klasik Ödeme Formu API'sini
(`server/src/services/shopier.js`) kullanarak imzalı form alanları döner; frontend bunlarla otomatik bir
form submit ederek kullanıcıyı Shopier'e yönlendirir. Ödeme sonrası Shopier, mağaza panelinde
tanımlayacağınız (Entegrasyonlar > Otomatik Sipariş Bildirimi) `POST /api/shopier/callback` adresine
bir **OSB (Otomatik Sipariş Bildirimi)** bildirimi gönderir.

**OSB formatı (giden form imzasından TAMAMEN FARKLI, gerçek trafik yakalanarak doğrulandı):**
Shopier `multipart/form-data` ile iki alan gönderir — `res` (sipariş bilgisini içeren base64 JSON) ve
`hash` (doğrulama). Doğrulama: `hash = HMAC-SHA256(key=API_secret, data=res + API_key).hex()`. `res`
base64 çözülünce `{ email, orderid, currency, price, buyername, buyersurname, productcount, productid,
productlist, chartdetails, customernote, istest }` alanlarını içeren bir JSON çıkar — `orderid`,
ödeme formunu oluştururken gönderdiğimiz `platform_order_id`'nin (yani kendi `orders.id`'mizin)
aynısıdır, `istest` ise Shopier panelindeki "OSB Testi" aracıyla gönderilen sahte bildirimleri
(`1`) gerçek ödemelerden (`0`) ayırt eder. **Kritik:** Shopier, doğrulamanın başarılı sayılması için
yanıt gövdesinin TAM OLARAK `"success"` metnini içermesini bekliyor (`"OK"` gibi başka bir yanıt
"Test başarısız" ile sonuçlanır — panelin kendi "OSB örnek kodunu görüntüle" linkindeki resmi PHP
örneğinde `echo "success";` şeklinde gösteriliyor, ama online dokümantasyon/üçüncü parti SDK'lar bunu
belgelemiyor).

**iyzico:** Kullanıcı sepette "Ödemeye Geç"e bastığında iyzico'nun Checkout Form API'sini
(`server/src/services/iyzico.js`) başlatır ve dönen `paymentPageUrl`'e yönlendirir. İşlem tamamlanınca
tarayıcı `POST /api/iyzico/callback` adresine yönlendirilir (bir `token` ile). Bu token'ın kendisi
güvenilmez — sunucu, gerçek sonucu öğrenmek için iyzico'nun API'sine kendi
`IYZICO_API_KEY`/`IYZICO_SECRET_KEY`'i ile sorar (`checkoutForm.retrieve`); yalnızca bu doğrulanmış
yanıt `paymentStatus: 'SUCCESS'` dönerse sipariş `paid` olur. iyzico ayrıca dolandırıcılık kontrolü
için alıcının TC Kimlik No ve telefon bilgisini zorunlu kılıyor — bu bilgi ödeme adımında bir
kereliğine sorulup `users` tablosuna kaydedilir (Shopier aktifken bu alan gösterilmez).
**Önemli:** `IYZICO_BASE_URL` varsayılan olarak sandbox'a ayarlı — canlıya almadan önce
`https://api.iyzipay.com` yapmayı unutmayın.

Her iki sağlayıcı için de ödeme onaylandıktan sonraki ortak mantık (abonelik süresi damgalama, lisans
anahtarı oluşturma, e-posta gönderimi) `server/src/services/orderFulfillment.js`'de tek bir yerde
toplanır — sağlayıcıya özgü route'lar sadece imza/token doğrulayıp bu paylaşılan fonksiyonları çağırır.

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
