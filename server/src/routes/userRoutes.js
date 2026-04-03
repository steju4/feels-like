/*
  User Routes (AthletenVerwaltung)
  
  Endpunkte für User-Verwaltung.
  - GET /me (profilLaden)
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

router.get('/', authMiddleware, requireRole('trainer'), userController.athletenListe);
router.post('/', authMiddleware, requireRole('trainer'), userController.athletAnlegen);
router.put('/:id/status', authMiddleware, requireRole('trainer'), userController.athletStatusAendern);

module.exports = router;
