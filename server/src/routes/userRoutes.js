/*
  Routen für Profil und Athletenverwaltung.
  Eigene Profilrouten sind nur authentifiziert, Admin-Aktionen zusätzlich nur für Trainer.
*/

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

// Profil des eingeloggten Nutzers
router.get('/me', authMiddleware, userController.profilLaden);
router.put('/me', authMiddleware, userController.profilAktualisieren);
router.put('/me/password', authMiddleware, userController.eigenesPasswortAendern);

// Trainerbereich: Athleten verwalten
router.get('/', authMiddleware, requireRole('trainer'), userController.athletenListe);
router.post('/', authMiddleware, requireRole('trainer'), userController.athletAnlegen);
router.put('/:id/status', authMiddleware, requireRole('trainer'), userController.athletStatusAendern);

module.exports = router;
