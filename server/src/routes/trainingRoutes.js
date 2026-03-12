const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authMiddleware = require('../middleware/authMiddleware');

// Alle Routen mit authMiddleware absichern
router.use(authMiddleware);

// WICHTIG: /stats vor /:id definieren, damit "stats" nicht als ID interpretiert wird
router.get('/stats', trainingController.getStats);

router.get('/', trainingController.getAlleTrainings);
router.post('/', trainingController.createTraining);
router.put('/:id', trainingController.updateTraining);
router.delete('/:id', trainingController.deleteTraining);

module.exports = router;