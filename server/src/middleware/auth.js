const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Oturum gerekli.' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Oturum geçersiz veya süresi dolmuş.' });
  }
}

module.exports = { requireAuth };
