/*
  User Routes (AthletenVerwaltung)
  
  Endpunkte für User-Verwaltung.
  - GET /me (profilLaden)
  - GET / (athletenListe - Nur Trainer)
*/

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Profil abrufen (geschützt)
router.get('/me', authMiddleware, userController.profilLaden);

module.exports = router;
