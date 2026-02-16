/*
  Training Routes (TrainingsVerwaltung)
  
  CRUD-Endpunkte für Trainings. MUSS durch authMiddleware geschützt sein.
  Routen:
  - GET / (alleTrainings)
  - POST / (trainingErfassen)
  - PUT /:id (trainingAendern)
  - DELETE /:id (trainingLoeschen)
*/

const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
// const authMiddleware = require('../middleware/authMiddleware');

// Beispiel:
// router.get('/', authMiddleware, trainingController.alleTrainings);

module.exports = router;
