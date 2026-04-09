/*
  Ranking-Endpunkt für die Trainerauswertung.
  /statistik liefert persönliche Dashboard-Kennzahlen für Athleten.
  / bleibt die trainergebundene Rankinganalyse.
*/

const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

router.get('/statistik', authMiddleware, rankingController.berechneStatistik);

// Reihenfolge: erst Auth, dann Rollenprüfung
router.get('/', authMiddleware, requireRole('trainer'), rankingController.berechneRanking);

module.exports = router;
