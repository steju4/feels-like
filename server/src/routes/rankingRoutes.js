/*
  Ranking-Endpunkt für die Trainerauswertung.
  Zugriff nur mit gültiger Session und Rolle "trainer".
*/

const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

// Reihenfolge wichtig: erst Auth, dann Rollenprüfung
router.get('/', authMiddleware, requireRole('trainer'), rankingController.berechneRanking);

module.exports = router;
