/*
  Training Service (TrainingsVerwaltung – Geschäftslogik)

    Kontrollklasse "TrainingsVerwaltung" aus dem Grobdesign:
    +trainingErfassen(athlet, daten : Trainingseinheit)
    +trainingAendern(einheit, neueDaten)
    +trainingLoeschen(einheit)

  Schicht 2 (Fachklassenpaket) gemäß Software Detailed Design Document.
  Kapselt gesamte Geschäftslogik und Validierung.
  Der Controller (Schicht 1) delegiert hierhin, und dieser Service
  greift auf das Sequelize-Model (Schicht 3 / Datenhaltung) zu.
*/

const Trainingseinheit = require('../models/Trainingseinheit');

// Erlaubte Sportarten
const ERLAUBTE_SPORTARTEN = ['Laufen', 'Radfahren', 'Schwimmen'];

/**
 * Validiert die Eingabedaten einer Trainingseinheit.
 * Pflichtfelder: datum, sportart, dauer
 * Dauer muss > 0 sein, Distanz (falls angegeben) >= 0
 * feelsLikeScore muss zwischen 1 und 10 liegen
 *
 * @param {Object} daten – Die Formulardaten
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateTrainingsDaten(daten) {
  const errors = [];

  // Pflichtfeld: datum
  if (!daten.datum) {
    errors.push('Datum ist ein Pflichtfeld.');
  }

  // Pflichtfeld: sportart
  if (!daten.sportart) {
    errors.push('Sportart ist ein Pflichtfeld.');
  } else if (!ERLAUBTE_SPORTARTEN.includes(daten.sportart)) {
    errors.push(`Sportart muss eine der folgenden sein: ${ERLAUBTE_SPORTARTEN.join(', ')}.`);
  }

  // Pflichtfeld: dauer > 0
  if (daten.dauer === undefined || daten.dauer === null || daten.dauer === '') {
    errors.push('Dauer ist ein Pflichtfeld.');
  } else if (Number(daten.dauer) <= 0 || !Number.isFinite(Number(daten.dauer))) {
    errors.push('Dauer muss eine positive Zahl sein (> 0).');
  }

  // Optionales Feld: distanz >= 0
  if (daten.distanz !== undefined && daten.distanz !== null && daten.distanz !== '') {
    if (Number(daten.distanz) < 0 || !Number.isFinite(Number(daten.distanz))) {
      errors.push('Distanz muss eine nicht-negative Zahl sein (≥ 0).');
    }
  }

  // Pflichtfeld: feelsLikeScore (1–10)
  if (daten.feelsLikeScore === undefined || daten.feelsLikeScore === null || daten.feelsLikeScore === '') {
    errors.push('FeelsLike-Score ist ein Pflichtfeld.');
  } else {
    const score = Number(daten.feelsLikeScore);
    if (!Number.isInteger(score) || score < 1 || score > 10) {
      errors.push('FeelsLike-Score muss eine ganze Zahl zwischen 1 und 10 sein.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * trainingErfassen – Neues Training für einen Athleten anlegen.
 * UC-04: „Athlet erfasst neue Trainingseinheit mit erforderlichen Daten"
 *
 * @param {number} athletId – ID des eingeloggten Athleten
 * @param {Object} daten – { datum, sportart, dauer, distanz, feelsLikeScore, note }
 * @returns {Promise<Trainingseinheit>}
 */
async function trainingErfassen(athletId, daten) {
  const validation = validateTrainingsDaten(daten);
  if (!validation.valid) {
    const error = new Error(validation.errors.join(' '));
    error.status = 400;
    throw error;
  }

  const training = await Trainingseinheit.create({
    datum: daten.datum,
    sportart: daten.sportart,
    dauer: Number(daten.dauer),
    distanz: daten.distanz !== undefined && daten.distanz !== null && daten.distanz !== ''
      ? Number(daten.distanz)
      : null,
    feelsLikeScore: Number(daten.feelsLikeScore),
    note: daten.note || null,
    athletId,
  });

  return training;
}

/**
 * alleTrainings – Alle Trainingseinheiten eines Athleten laden.
 * Athlet sieht nur seine eigenen Trainings.
 *
 * @param {number} athletId – ID des eingeloggten Athleten
 * @returns {Promise<Trainingseinheit[]>}
 */
async function alleTrainings(athletId) {
  const trainings = await Trainingseinheit.findAll({
    where: { athletId },
    order: [['datum', 'DESC']],
  });
  return trainings;
}

/**
 * trainingAendern – Bestehendes Training bearbeiten.
 * Prüft, ob das Training dem Athleten gehört (Autorisierung).
 * UC-04: „Athlet wählt bestehende Einheit aus und ändert die Daten"
 *
 * @param {number} trainingId – ID der Trainingseinheit
 * @param {number} athletId – ID des eingeloggten Athleten
 * @param {Object} neueDaten – Aktualisierte Felder
 * @returns {Promise<Trainingseinheit>}
 */
async function trainingAendern(trainingId, athletId, neueDaten) {
  const training = await Trainingseinheit.findByPk(trainingId);

  if (!training) {
    const error = new Error('Trainingseinheit nicht gefunden.');
    error.status = 404;
    throw error;
  }

  // Autorisierung: Nur eigene Trainings bearbeiten
  if (training.athletId !== athletId) {
    const error = new Error('Keine Berechtigung, dieses Training zu bearbeiten.');
    error.status = 403;
    throw error;
  }

  // Validierung der neuen Daten
  const validation = validateTrainingsDaten(neueDaten);
  if (!validation.valid) {
    const error = new Error(validation.errors.join(' '));
    error.status = 400;
    throw error;
  }

  // Update durchführen
  training.datum = neueDaten.datum;
  training.sportart = neueDaten.sportart;
  training.dauer = Number(neueDaten.dauer);
  training.distanz = neueDaten.distanz !== undefined && neueDaten.distanz !== null && neueDaten.distanz !== ''
    ? Number(neueDaten.distanz)
    : null;
  training.feelsLikeScore = Number(neueDaten.feelsLikeScore);
  training.note = neueDaten.note || null;

  await training.save();
  return training;
}

/**
 * trainingLoeschen – Training löschen.
 * Prüft, ob das Training dem Athleten gehört (Autorisierung).
 * UC-04: „Athlet wählt bestehende Einheit zum Löschen aus"
 *
 * @param {number} trainingId – ID der Trainingseinheit
 * @param {number} athletId – ID des eingeloggten Athleten
 * @returns {Promise<void>}
 */
async function trainingLoeschen(trainingId, athletId) {
  const training = await Trainingseinheit.findByPk(trainingId);

  if (!training) {
    const error = new Error('Trainingseinheit nicht gefunden.');
    error.status = 404;
    throw error;
  }

  // Autorisierung: Nur eigene Trainings löschen
  if (training.athletId !== athletId) {
    const error = new Error('Keine Berechtigung, dieses Training zu löschen.');
    error.status = 403;
    throw error;
  }

  await training.destroy();
}

module.exports = {
  trainingErfassen,
  alleTrainings,
  trainingAendern,
  trainingLoeschen,
  validateTrainingsDaten,
  ERLAUBTE_SPORTARTEN,
};
