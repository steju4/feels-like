/*
  User Routes (AthletenVerwaltung)
  
  Endpunkte für User-Verwaltung.
  - GET /me (profilLaden)
  - PUT /me (profilAktualisieren)
  - PUT /me/password (eigenesPasswortAendern)
  - GET / (athletenListe - Nur Trainer)
  - POST / (athletAnlegen - Nur Trainer)
  - PUT /:id/status (athletStatusAendern - Nur Trainer)
*/

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

// Profil abrufen (geschützt)
router.get('/me', authMiddleware, userController.profilLaden);
router.put('/me', authMiddleware, userController.profilAktualisieren);
router.put('/me/password', authMiddleware, userController.eigenesPasswortAendern);

router.get('/', authMiddleware, requireRole('trainer'), userController.athletenListe);
router.post('/', authMiddleware, requireRole('trainer'), userController.athletAnlegen);
router.put('/:id/status', authMiddleware, requireRole('trainer'), userController.athletStatusAendern);

module.exports = router;
