/*
  TODO: Auth Middleware
  
  Diese Middleware schützt Routen.
  Aufgaben:
  1. JWT Token aus dem 'token' Cookie lesen.
  2. Token mit dem Secret verifizieren.
  3. Bei Erfolg: Die User-ID/Rolle in das `req`-Objekt schreiben (z.B. req.user).
  4. Bei Fehler: 401 Unauthorized zurückgeben.
*/

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Token aus Cookie oder Authorization-Header lesen
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = cookieToken || headerToken;
  
  if (!token) {
    return res.status(401).json({ message: 'Zugriff verweigert.' });
  }

  try {
    // 2. Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    
    // 3. User in req speichern
    // Ab hier Zugriff auf req.user.id, req.user.role, etc.
    req.user = decoded;
    
    next();
  } catch (error) {
    // Bei ungültigem Token Cookie löschen
    res.clearCookie('token');
    return res.status(401).json({ message: 'Token ungültig oder abgelaufen.' });
  }
};
