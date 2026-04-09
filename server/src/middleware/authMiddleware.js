/*
  JWT-Absicherung für API-Routen.
  Akzeptiert Bearer-Token oder Session-Cookie.
*/

const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwtSecret');

module.exports = (req, res, next) => {
  // Header priorisieren, damit API-Clients die Auth steuern können
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ message: 'Zugriff verweigert.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;

    next();
  } catch (error) {
    if (error?.status === 500) {
      console.error('Konfigurationsfehler in authMiddleware:', error);
      return res.status(500).json({ message: 'Serverkonfiguration unvollständig.' });
    }

    // Bei ungültigem Token Session-Cookie vorsorglich löschen
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return res.status(401).json({ message: 'Token ungültig oder abgelaufen.' });
  }
};
