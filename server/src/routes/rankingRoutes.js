/*
  Ranking Routes (AnalyseService)
  
  Endpunkte für Bestenlisten.
  - GET / (berechneRanking)
*/

const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

// router.get('/', rankingController.berechneRanking);

module.exports = router;
