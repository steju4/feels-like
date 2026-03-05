/*
  Ranking Routes (AnalyseService)
  
  Endpunkte für Bestenlisten.
  - GET / (berechneRanking)
*/

const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, rankingController.berechneRanking);

module.exports = router;
