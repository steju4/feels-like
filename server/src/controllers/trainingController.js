/*
  Training Controller (TrainingsVerwaltung)
  
  Schicht 1 (Oberflächenpaket / API-Schicht) nach SDD.
  Nimmt HTTP-Requests entgegen, delegiert an den TrainingService (Schicht 2)
  und gibt HTTP-Responses zurück.
  
  Da Routen mit `authMiddleware` geschützt werden, hat man Zugriff auf req.user
  (enthält id, role, name aus dem JWT-Token).
  
  Funktionen (Kontrollklasse TrainingsVerwaltung):
  - trainingErfassen: Neues Training anlegen (POST)
  - alleTrainings: Alle Trainings des eingeloggten Users holen (GET)
  - trainingAendern: Bestehendes Training bearbeiten (PUT)
  - trainingLoeschen: Training löschen (DELETE)
*/

const trainingService = require('../services/trainingService');

/**
 * POST /api/training
 * Neues Training anlegen.
 * Body: { datum, sportart, dauer, distanz, feelsLikeScore, note }
 */
exports.trainingErfassen = async (req, res) => {
  try {
    const athletId = req.user.id;
    const training = await trainingService.trainingErfassen(athletId, req.body);
    res.status(201).json(training);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

/**
 * GET /api/training
 * Alle Trainings des eingeloggten Athleten laden.
 * Athlet sieht nur eigene Trainings (Datenisolation wird im Service sichergestellt).
 */
exports.alleTrainings = async (req, res) => {
  try {
    const athletId = req.user.id;
    const trainings = await trainingService.alleTrainings(athletId);
    res.json(trainings);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

/**
 * PUT /api/training/:id
 * Bestehendes Training bearbeiten.
 * Nur der Besitzer darf sein eigenes Training ändern.
 * Body: { datum, sportart, dauer, distanz, feelsLikeScore, note }
 */
exports.trainingAendern = async (req, res) => {
  try {
    const athletId = req.user.id;
    const trainingId = parseInt(req.params.id, 10);
    const training = await trainingService.trainingAendern(trainingId, athletId, req.body);
    res.json(training);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};

/**
 * DELETE /api/training/:id
 * Training löschen.
 * Nur der Besitzer darf sein eigenes Training löschen.
 */
exports.trainingLoeschen = async (req, res) => {
  try {
    const athletId = req.user.id;
    const trainingId = parseInt(req.params.id, 10);
    await trainingService.trainingLoeschen(trainingId, athletId);
    res.json({ message: 'Trainingseinheit erfolgreich gelöscht.' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};
