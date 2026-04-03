/*
  Rollen-Middleware

  Erlaubt den Zugriff nur, wenn req.user die erwartete Rolle besitzt.
  Muss nach authMiddleware eingesetzt werden.
*/

function requireRole(expectedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Nicht authentifiziert.' });
    }

    if (req.user.role !== expectedRole) {
      return res.status(403).json({ message: 'Keine Berechtigung für diese Aktion.' });
    }

    return next();
  };
}

module.exports = requireRole;
