/*
  TODO: Auth Middleware
  
  Diese Middleware schützt unsere Routen.
  Aufgaben:
  1. JWT Token aus dem 'Authorization' Header lesen (Bearer Token).
  2. Token mit dem Secret verifizieren.
  3. Bei Erfolg: Die User-ID/Rolle in das `req`-Objekt schreiben (z.B. req.user).
  4. Bei Fehler: 401 Unauthorized zurückgeben.
*/

module.exports = (req, res, next) => {
  // Logik hier implementieren
  next();
};
