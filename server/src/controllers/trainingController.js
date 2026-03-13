const trainingService = require('../services/trainingService');

function sendError(res, error) {
  const status = error.status || 500;
  return res.status(status).json({ message: error.message || 'Serverfehler' });
}

async function getStats(req, res) {
  try {
    const stats = await trainingService.trainingStatistik(req.user.id, req.query);
    return res.json(stats);
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAlleTrainings(req, res) {
  try {
    const trainings = await trainingService.alleTrainings(req.user.id, req.query);
    return res.json(trainings);
  } catch (error) {
    return sendError(res, error);
  }
}

async function createTraining(req, res) {
  try {
    const training = await trainingService.trainingErfassen(req.user.id, req.body);
    return res.status(201).json(training);
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateTraining(req, res) {
  try {
    const trainingId = parseInt(req.params.id, 10);
    const training = await trainingService.trainingAendern(trainingId, req.user.id, req.body);
    return res.json(training);
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteTraining(req, res) {
  try {
    const trainingId = parseInt(req.params.id, 10);
    await trainingService.trainingLoeschen(trainingId, req.user.id);
    return res.json({ message: 'Training erfolgreich geloescht.' });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  getStats,
  getAlleTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
};
