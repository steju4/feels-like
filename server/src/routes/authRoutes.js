/*
  Auth-Endpunkte für Login, Logout, Einladung-Registrierung
  und den Passwort-Reset-Flow.
*/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registrieren);
router.post('/login', authController.anmelden);
router.post('/logout', authController.abmelden);
router.post('/password-reset/request', authController.passwortResetAnfordern);
router.post('/password-reset/confirm', authController.passwortResetBestaetigen);

module.exports = router;
