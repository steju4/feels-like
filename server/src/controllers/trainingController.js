/*
  HTTP-Schicht für Trainings-CRUD und Dashboard-Stats.
  Validierung/Fachregeln liegen im trainingService.
*/

const trainingService = require('../services/trainingService');

function sendError(res, error) {
  const status = error.status || 500;

  // Fach-/Validierungsfehler sauber an den Client zurückgeben
  if (status >= 400 && status < 500) {
    return res.status(status).json({ message: error.message || 'Serverfehler' });
  }

  console.error('Unexpected error in trainingController:', error);
  return res.status(status).json({ message: 'Serverfehler' });
}

async function trainingErfassen(req, res) {
  try {
    const training = await trainingService.trainingErfassen(req.user.id, req.body);
    return res.status(201).json(training);
  } catch (error) {
    return sendError(res, error);
  }
}

async function alleTrainings(req, res) {
  try {
    const trainings = await trainingService.alleTrainings(req.user.id, req.query);
    return res.json(trainings);
  } catch (error) {
    return sendError(res, error);
  }
}

async function trainingAendern(req, res) {
  try {
    const trainingId = parseInt(req.params.id, 10);
    if (!Number.isInteger(trainingId)) {
      return res.status(400).json({ message: 'Ungültige Trainings-ID.' });
    }

    const training = await trainingService.trainingAendern(trainingId, req.user.id, req.body);
    return res.json(training);
  } catch (error) {
    return sendError(res, error);
  }
}

async function trainingLoeschen(req, res) {
  try {
    const trainingId = parseInt(req.params.id, 10);
    if (!Number.isInteger(trainingId)) {
      return res.status(400).json({ message: 'Ungültige Trainings-ID.' });
    }

    await trainingService.trainingLoeschen(trainingId, req.user.id);
    return res.json({ message: 'Trainingseinheit erfolgreich gelöscht.' });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getStats(req, res) {
  try {
    const stats = await trainingService.trainingStatistik(req.user.id, req.query);
    return res.json(stats);
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  trainingErfassen,
  alleTrainings,
  trainingAendern,
  trainingLoeschen,
  getStats,
  // Alias-Namen für Dashboard-Routenkompatibilität
  createTraining: trainingErfassen,
  getAlleTrainings: alleTrainings,
  updateTraining: trainingAendern,
  deleteTraining: trainingLoeschen,
};
