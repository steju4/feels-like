/*
  TODO: User Routes
  
  Endpunkte für User-Verwaltung.
  - GET /me (Eigenes Profil)
  - GET / (Alle User - Nur Trainer?)
*/

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Profil abrufen (geschützt)
router.get('/me', authMiddleware, userController.getProfile);

module.exports = router;
