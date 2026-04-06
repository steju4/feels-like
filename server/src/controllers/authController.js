/*
  Controller für Login, Logout, Einladung-Registrierung und Passwort-Reset.
  Die Fachlogik liegt im authService, hier passiert vor allem Request/Response-Mapping.
*/

const authService = require('../services/authService');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions() {
  // Einheitliche Cookie-Optionen für Login/Session
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  };
}

function handleControllerError(res, error, defaultMessage) {
  // Servicefehler mit Status durchreichen, sonst generischer 500-Fallback
  if (error?.status) {
    if (error.status >= 500) {
      console.error(error);
    }
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: defaultMessage });
}

exports.anmelden = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich' });
  }

  try {
    const { token, user } = await authService.anmelden(email, password);

    // Session-Token nur im HttpOnly-Cookie setzen
    res.cookie('token', token, getCookieOptions());

    // Token absichtlich nicht im JSON-Body zurückgeben
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

exports.registrieren = async (req, res) => {
  try {
    const result = await authService.registrierenMitEinladung(req.body || {});
    return res.json(result);
  } catch (error) {
    return handleControllerError(res, error, 'Serverfehler bei der Registrierung.');
  }
};

exports.passwortResetAnfordern = async (req, res) => {
  try {
    const result = await authService.passwortResetAnfordern({
      email: req.body?.email,
    });

    return res.json(result);
  } catch (error) {
    return handleControllerError(res, error, 'Serverfehler beim Anfordern des Passwort-Resets.');
  }
};

exports.passwortResetBestaetigen = async (req, res) => {
  try {
    const result = await authService.passwortResetBestaetigen({
      token: req.body?.token,
      password: req.body?.password,
      passwordConfirm: req.body?.passwordConfirm,
    });

    return res.json(result);
  } catch (error) {
    return handleControllerError(res, error, 'Serverfehler beim Zurücksetzen des Passworts.');
  }
};
