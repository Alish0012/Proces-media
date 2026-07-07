const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const shopierRoutes = require('./routes/shopier');
const downloadRoutes = require('./routes/downloads');

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
app.use('/api/shopier', shopierRoutes);
app.use('/api/downloads', downloadRoutes);

app.use((req, res) => res.status(404).json({ error: 'Bulunamadı.' }));
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Proces Media API http://localhost:${config.port} adresinde çalışıyor`);
});
