/*
  Ranking Routes (AnalyseService)
  
  Endpunkte für Bestenlisten.
  - GET / (berechneRanking)
*/

const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

router.get('/', authMiddleware, requireRole('trainer'), rankingController.berechneRanking);

module.exports = router;
