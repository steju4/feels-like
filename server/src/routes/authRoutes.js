/*
  TODO: Auth Routes
  
  Definition der Endpunkte für Authentifizierung.
  Ungefähre Routen:
  - POST /login
  - POST /register (falls benötigt)
*/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// router.post('/login', authController.login);

module.exports = router;
