const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const iyzicoRoutes = require('./routes/iyzico');
const downloadRoutes = require('./routes/downloads');
const licenseRoutes = require('./routes/license');

// SMTP/DB gibi dış servislerle konuşan kütüphaneler bazen promise reddi dışında,
// bağlantı temizliği sırasında gecikmeli bir 'error' event'i de yayınlayabiliyor.
// Bu tür yakalanmamış hatalar dinleyicisiz kalırsa Node tüm süreci çökertir —
// tek bir SMTP/DB hatası yüzünden sitenin tamamen düşmesini istemiyoruz.
process.on('unhandledRejection', (err) => {
  console.error('Yakalanmamış promise reddi:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Yakalanmamış istisna:', err);
});

const app = express();

// Önümüzde bir reverse proxy (nginx vb.) olmadığı sürece X-Forwarded-For
// başlığına güvenmiyoruz — aksi halde IP tabanlı rate limit/loglama sahtelenebilir.
app.set('trust proxy', false);

app.use(helmet());
app.use(cors({ origin: config.webUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', apiLimiter);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/iyzico', iyzicoRoutes);
app.use('/api/downloads', downloadRoutes);

// Kurulu eklenti (Premiere Pro CEP paneli) bu uca file:// kökeninden erişir —
// üstteki genel CORS politikası (sadece WEB_URL) burada geçerli olamaz. Bu uç
// zaten oturum/çerez kullanmıyor, tek başına bilinmesi gereken bir license_key
// ile korunuyor, bu yüzden kökeni serbest bırakmak güvenli.
app.use('/api/license', cors({ origin: true }), licenseRoutes);

app.use((req, res) => res.status(404).json({ error: 'Bulunamadı.' }));
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Proces Media API http://localhost:${config.port} adresinde çalışıyor`);
});
