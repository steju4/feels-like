/*
  Auth Middleware

  Schützt Routen durch JWT-Verifizierung.
  Token-Quellen:
  1) Authorization: Bearer <token> (bevorzugt)
  2) HttpOnly-Cookie 'token' (Browser-Session)
*/

const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_SECRET ist nicht gesetzt.');
    error.status = 500;
    throw error;
  }
  return secret;
}

module.exports = (req, res, next) => {
  // Header priorisieren, damit API-Clients explizit Auth steuern koennen.
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
    // Bei ungueltigem Token Session-Cookie defensiv loeschen
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return res.status(401).json({ message: 'Token ungültig oder abgelaufen.' });
  }
};
