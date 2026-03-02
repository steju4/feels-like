/*
  Training Routes (TrainingsVerwaltung)
  
  CRUD-Endpunkte für Trainings. Geschützt durch authMiddleware.
  Alle Routen erfordern einen gültigen JWT-Token (HttpOnly Cookie).
  
  Routen:
  - GET    /api/training       → alleTrainings   (Alle eigenen Trainings laden)
  - POST   /api/training       → trainingErfassen (Neues Training anlegen)
  - PUT    /api/training/:id   → trainingAendern  (Training bearbeiten)
  - DELETE /api/training/:id   → trainingLoeschen (Training löschen)
*/

const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authMiddleware = require('../middleware/authMiddleware');

// GET  /api/training – Alle Trainings des eingeloggten Athleten
router.get('/', authMiddleware, trainingController.alleTrainings);

// POST /api/training – Neues Training erfassen
router.post('/', authMiddleware, trainingController.trainingErfassen);

// PUT  /api/training/:id – Bestehendes Training ändern
router.put('/:id', authMiddleware, trainingController.trainingAendern);

// DELETE /api/training/:id – Training löschen
router.delete('/:id', authMiddleware, trainingController.trainingLoeschen);

module.exports = router;
