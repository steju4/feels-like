/*
  TODO: Training Routes
  
  CRUD-Endpunkte für Trainings. MUSS durch authMiddleware geschützt sein.
  Ungefähre Routen:
  - GET / (Alle Trainings listen)
  - POST / (Neues Training)
  - GET /:id (Details)
  - PUT /:id (Update)
  - DELETE /:id (Löschen)
*/

const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
// const authMiddleware = require('../middleware/authMiddleware');

// Beispiel:
// router.get('/', authMiddleware, trainingController.getAllTrainings);

module.exports = router;
