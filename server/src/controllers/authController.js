/*
  Auth Controller (Kontoverwaltung)
  
  Steuert den Authentifizierungs-Flow.
  Funktionen:
  - anmelden: Credentials validieren -> AuthService aufrufen -> Session-Cookie setzen.
  - abmelden: Session beenden.
*/

const authService = require('../services/authService');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  };
}

exports.anmelden = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich' });
  }

  try {
    const { token, user } = await authService.anmelden(email, password);

    // Session über HttpOnly-Cookie (primärer Kanal)
    res.cookie('token', token, getCookieOptions());

    // Keine Token-Rückgabe im Body, um unnötige Exposition zu vermeiden.
    res.json({
      message: 'Erfolgreich eingeloggt',
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message || 'Serverfehler beim Login' });
  }
};

exports.abmelden = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ message: 'Erfolgreich ausgeloggt' });
};
