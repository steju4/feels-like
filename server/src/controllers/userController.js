/*
  TODO: User/Athlet Controller
  
  Verwaltung der Benutzer.
  Funktionen:
  - getProfile: Eigene Daten laden.
  - getAllAthletes: (Nur für Trainer) Liste aller Athleten laden.
  - inviteAthlet: (Nur für Trainer) Neuen User anlegen/einladen.
*/

const Athlet = require('../models/Athlet');

// Beispiel wie man die /me Route nutzt
// Frontend ruft GET /api/users/me auf -> Controller antwortet.
exports.getProfile = async (req, res) => {
  try {
    // req.user.id kommt aus dem Token
    const user = await Athlet.findByPk(req.user.id, {
      attributes: { exclude: ['passwortHash'] } // Passwort nicht zurückgeben
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User nicht gefunden' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Laden des Profils' });
  }
};
