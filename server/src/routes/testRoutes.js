const express = require('express');
const router = express.Router();
const Athlet = require('../models/Athlet');

// GET /api/test
router.get('/test', async (req, res) => {
  try {
    // Versuch, Datenbank abzufragen
    const count = await Athlet.count();
    
    res.status(200).json({
      message: 'Verbindung erfolgreich! 🚀',
      info: 'Datenbank ist verbunden.',
      athleteCount: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Fehler bei der Verbindung ❌',
      error: error.message
    });
  }
});

module.exports = router;
