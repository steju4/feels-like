const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// WICHTIG: /stats vor /:id, damit "stats" nicht als ID interpretiert wird.
router.get('/stats', trainingController.getStats);

router.get('/', trainingController.alleTrainings);
router.post('/', trainingController.trainingErfassen);
router.put('/:id', trainingController.trainingAendern);
router.delete('/:id', trainingController.trainingLoeschen);

module.exports = router;
