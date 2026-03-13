/*
  Auth Controller (Kontoverwaltung)
  
  Steuert den Authentifizierungs-Flow.
  Funktionen:
  - anmelden: User Credentials prüfen -> JWT Token ausstellen -> zurücksenden.
  - abmelden: Session beenden.
*/

const jwt = require('jsonwebtoken');
const Athlet = require('../models/Athlet');

exports.anmelden = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich' });
  }

  try {
    // 1. User suchen
    const user = await Athlet.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'E-Mail oder Passwort falsch' });
    }

    // 2. Passwort prüfen
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'E-Mail oder Passwort falsch' });
    }

    // 3. Token erstellen
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token ist 7 Tage gültig
    );

    // 4. Token als HttpOnly Cookie senden
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    // 5. Antwort senden (Token auch im Body für Header-basierte Nutzung)
    res.json({
      message: 'Erfolgreich eingeloggt',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfehler beim Login' });
  }
};

exports.abmelden = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  });
  res.json({ message: 'Erfolgreich ausgeloggt' });
};
