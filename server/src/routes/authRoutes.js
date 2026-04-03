/*
  Auth Routes (Kontoverwaltung)
  
  Definition der Endpunkte für Authentifizierung.
  - POST /register (registrieren)
  Routen:
  - POST /login (anmelden)
  - POST /logout (abmelden)
*/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registrieren);
router.post('/login', authController.anmelden);
router.post('/logout', authController.abmelden);

module.exports = router;
