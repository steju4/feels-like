/*
  User Controller (AthletenVerwaltung)
  
  Verwaltung der Benutzer.
  Funktionen:
  - profilLaden: Eigene Daten laden.
  - athletenListe: (Nur für Trainer) Liste aller Athleten laden.
  - athletAnlegen: (Nur für Trainer) Neuen User anlegen/einladen.
*/

const Athlet = require('../models/Athlet');

exports.profilLaden = async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Laden des Profils' });
  }
};
