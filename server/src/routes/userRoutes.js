/*
  TODO: User Routes
  
  Endpunkte für User-Verwaltung.
  - GET /me (Eigenes Profil)
  - GET / (Alle User - Nur Trainer?)
*/

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// router.get('/me', userController.getProfile);

module.exports = router;
