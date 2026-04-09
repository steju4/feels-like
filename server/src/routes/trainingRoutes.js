/*
	Trainings-Routen für erfassen, lesen, ändern, löschen und Statistik.
	Alle Endpunkte sind authentifiziert.
*/

const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// WICHTIG: /stats vor /:id, damit stats nicht als ID interpretiert wird
router.get('/stats', trainingController.getStats);
// WICHTIG: /export vor /:id, damit export nicht als ID interpretiert wird
router.get('/export', trainingController.exportiereTrainings);

router.get('/', trainingController.alleTrainings);
router.post('/', trainingController.trainingErfassen);
router.put('/:id', trainingController.trainingAendern);
router.delete('/:id', trainingController.trainingLoeschen);

module.exports = router;
