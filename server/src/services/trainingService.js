/*
  Training Service (TrainingsVerwaltung – Geschäftslogik)

  Schicht 2 gemäß SDD:
  - Validierung und Autorisierung für CRUD
  - Filterlogik für Dashboard-Ansicht
  - Statistikberechnung für Dashboard-Kennzahlen
*/

const { Op } = require('sequelize');
const Trainingseinheit = require('../models/Trainingseinheit');

const ERLAUBTE_SPORTARTEN = ['Laufen', 'Radfahren', 'Schwimmen'];

function formatDateOnlyLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateTrainingsDaten(daten) {
  const errors = [];

  if (!daten.datum) {
    errors.push('Datum ist ein Pflichtfeld.');
  }

  if (!daten.sportart) {
    errors.push('Sportart ist ein Pflichtfeld.');
  } else if (!ERLAUBTE_SPORTARTEN.includes(daten.sportart)) {
    errors.push(`Sportart muss eine der folgenden sein: ${ERLAUBTE_SPORTARTEN.join(', ')}.`);
  }

  if (daten.dauer === undefined || daten.dauer === null || daten.dauer === '') {
    errors.push('Dauer ist ein Pflichtfeld.');
  } else if (Number(daten.dauer) <= 0 || !Number.isFinite(Number(daten.dauer))) {
    errors.push('Dauer muss eine positive Zahl sein (> 0).');
  }

  if (daten.distanz !== undefined && daten.distanz !== null && daten.distanz !== '') {
    if (Number(daten.distanz) < 0 || !Number.isFinite(Number(daten.distanz))) {
      errors.push('Distanz muss eine nicht-negative Zahl sein (>= 0).');
    }
  }

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

function getVonDatum(zeitraum) {
  if (!zeitraum) return null;

  const now = new Date();
  const vonDatum = new Date(now);

  switch (zeitraum) {
    case 'woche':
      vonDatum.setDate(now.getDate() - 7);
      break;
    case 'monat':
      vonDatum.setMonth(now.getMonth() - 1);
      break;
    case 'quartal':
      vonDatum.setMonth(now.getMonth() - 3);
      break;
    case 'jahr':
      vonDatum.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }

  return formatDateOnlyLocal(vonDatum);
}

function buildWhereClause(athletId, { sportart, zeitraum } = {}) {
  const where = { athletId };

  if (sportart && ERLAUBTE_SPORTARTEN.includes(sportart)) {
    where.sportart = sportart;
  }

  const vonDatum = getVonDatum(zeitraum);
  if (vonDatum) {
    where.datum = { [Op.gte]: vonDatum };
  }

  return where;
}

async function trainingErfassen(athletId, daten) {
  const validation = validateTrainingsDaten(daten);
  if (!validation.valid) {
    throw createHttpError(400, validation.errors.join(' '));
  }

  return Trainingseinheit.create({
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
}

async function alleTrainings(athletId, filter = {}) {
  const where = buildWhereClause(athletId, filter);

  return Trainingseinheit.findAll({
    where,
    order: [['datum', 'DESC']],
  });
}

async function trainingAendern(trainingId, athletId, neueDaten) {
  const training = await Trainingseinheit.findByPk(trainingId);

  if (!training) {
    throw createHttpError(404, 'Trainingseinheit nicht gefunden.');
  }

  if (training.athletId !== athletId) {
    throw createHttpError(403, 'Keine Berechtigung, dieses Training zu bearbeiten.');
  }

  const validation = validateTrainingsDaten(neueDaten);
  if (!validation.valid) {
    throw createHttpError(400, validation.errors.join(' '));
  }

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

async function trainingLoeschen(trainingId, athletId) {
  const training = await Trainingseinheit.findByPk(trainingId);

  if (!training) {
    throw createHttpError(404, 'Trainingseinheit nicht gefunden.');
  }

  if (training.athletId !== athletId) {
    throw createHttpError(403, 'Keine Berechtigung, dieses Training zu löschen.');
  }

  await training.destroy();
}

async function trainingStatistik(athletId, filter = {}) {
  const where = buildWhereClause(athletId, filter);
  const trainings = await Trainingseinheit.findAll({ where });

  if (trainings.length === 0) {
    return {
      gesamtDistanz: 0,
      anzahlTrainings: 0,
      gesamtDauer: 0,
      durchschnittFeelsLike: 0,
    };
  }

  const gesamtDistanz = trainings.reduce((sum, t) => sum + (parseFloat(t.distanz) || 0), 0);
  const gesamtDauer = trainings.reduce((sum, t) => sum + (parseInt(t.dauer, 10) || 0), 0);
  const feelsLikeSum = trainings.reduce((sum, t) => sum + (parseInt(t.feelsLikeScore, 10) || 0), 0);

  return {
    gesamtDistanz: Math.round(gesamtDistanz * 10) / 10,
    anzahlTrainings: trainings.length,
    gesamtDauer,
    durchschnittFeelsLike: Math.round((feelsLikeSum / trainings.length) * 10) / 10,
  };
}

module.exports = {
  ERLAUBTE_SPORTARTEN,
  validateTrainingsDaten,
  buildWhereClause,
  trainingErfassen,
  alleTrainings,
  trainingAendern,
  trainingLoeschen,
  trainingStatistik,
};
