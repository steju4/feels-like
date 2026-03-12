const { Op } = require('sequelize');
const Trainingseinheit = require('../models/Trainingseinheit');

const ALLOWED_SPORTARTEN = ['Laufen', 'Radfahren', 'Schwimmen'];

// ── Validierung ──────────────────────────────────────────────────────────────

function validateTrainingsDaten(daten) {
  const errors = [];

  if (!daten.datum) errors.push('Datum ist ein Pflichtfeld.');
  if (!daten.sportart) {
    errors.push('Sportart ist ein Pflichtfeld.');
  } else if (!ALLOWED_SPORTARTEN.includes(daten.sportart)) {
    errors.push(`Sportart muss eine der folgenden sein: ${ALLOWED_SPORTARTEN.join(', ')}.`);
  }
  if (daten.dauer === undefined || daten.dauer === null || daten.dauer === '') {
    errors.push('Dauer ist ein Pflichtfeld.');
  } else if (Number(daten.dauer) <= 0) {
    errors.push('Dauer muss größer als 0 sein.');
  }
  if (daten.distanz !== undefined && daten.distanz !== null && daten.distanz !== '') {
    if (Number(daten.distanz) < 0) errors.push('Distanz darf nicht negativ sein.');
  }
  if (daten.feelsLikeScore === undefined || daten.feelsLikeScore === null || daten.feelsLikeScore === '') {
    errors.push('feelsLikeScore ist ein Pflichtfeld.');
  } else {
    const score = Number(daten.feelsLikeScore);
    if (!Number.isInteger(score) || score < 1 || score > 10) {
      errors.push('feelsLikeScore muss eine ganze Zahl zwischen 1 und 10 sein.');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Zeitraum-Filter Hilfsfunktion ────────────────────────────────────────────

function buildWhereClause(athletId, { sportart, zeitraum } = {}) {
  const where = { athletId };

  if (sportart && ALLOWED_SPORTARTEN.includes(sportart)) {
    where.sportart = sportart;
  }

  if (zeitraum) {
    const now = new Date();
    let vonDatum;
    switch (zeitraum) {
      case 'woche':
        vonDatum = new Date(now);
        vonDatum.setDate(now.getDate() - 7);
        break;
      case 'monat':
        vonDatum = new Date(now);
        vonDatum.setMonth(now.getMonth() - 1);
        break;
      case 'quartal':
        vonDatum = new Date(now);
        vonDatum.setMonth(now.getMonth() - 3);
        break;
      case 'jahr':
        vonDatum = new Date(now);
        vonDatum.setFullYear(now.getFullYear() - 1);
        break;
      default:
        vonDatum = null;
    }
    if (vonDatum) {
      where.datum = { [Op.gte]: vonDatum.toISOString().split('T')[0] };
    }
  }

  return where;
}

// ── GET /api/training/stats ──────────────────────────────────────────────────

async function getStats(req, res) {
  try {
    const { sportart, zeitraum } = req.query;
    const where = buildWhereClause(req.user.id, { sportart, zeitraum });

    const trainings = await Trainingseinheit.findAll({ where });

    if (trainings.length === 0) {
      return res.json({
        gesamtDistanz: 0,
        anzahlTrainings: 0,
        gesamtDauer: 0,
        durchschnittFeelsLike: 0,
      });
    }

    const gesamtDistanz = trainings.reduce((sum, t) => sum + (parseFloat(t.distanz) || 0), 0);
    const gesamtDauer = trainings.reduce((sum, t) => sum + (parseInt(t.dauer) || 0), 0);
    const feelsLikeSum = trainings.reduce((sum, t) => sum + (parseInt(t.feelsLikeScore) || 0), 0);
    const durchschnittFeelsLike = feelsLikeSum / trainings.length;

    res.json({
      gesamtDistanz: Math.round(gesamtDistanz * 10) / 10,
      anzahlTrainings: trainings.length,
      gesamtDauer,
      durchschnittFeelsLike: Math.round(durchschnittFeelsLike * 10) / 10,
    });
  } catch (err) {
    console.error('[trainingController] getStats error:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
}

// ── GET /api/training ────────────────────────────────────────────────────────

async function getAlleTrainings(req, res) {
  try {
    const { sportart, zeitraum } = req.query;
    const where = buildWhereClause(req.user.id, { sportart, zeitraum });

    const trainings = await Trainingseinheit.findAll({
      where,
      order: [['datum', 'DESC']],
    });

    res.json(trainings);
  } catch (err) {
    console.error('[trainingController] getAlleTrainings error:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
}

// ── POST /api/training ───────────────────────────────────────────────────────

async function createTraining(req, res) {
  try {
    const validation = validateTrainingsDaten(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.errors.join(' ') });
    }

    const training = await Trainingseinheit.create({
      datum: req.body.datum,
      sportart: req.body.sportart,
      dauer: req.body.dauer,
      distanz: req.body.distanz !== undefined && req.body.distanz !== '' ? req.body.distanz : null,
      feelsLikeScore: req.body.feelsLikeScore,
      note: req.body.note || null,
      athletId: req.user.id,
    });

    res.status(201).json(training);
  } catch (err) {
    console.error('[trainingController] createTraining error:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
}

// ── PUT /api/training/:id ────────────────────────────────────────────────────

async function updateTraining(req, res) {
  try {
    const training = await Trainingseinheit.findByPk(parseInt(req.params.id));
    if (!training) {
      return res.status(404).json({ message: 'Training nicht gefunden.' });
    }
    if (training.athletId !== req.user.id) {
      return res.status(403).json({ message: 'Keine Berechtigung.' });
    }

    const validation = validateTrainingsDaten(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.errors.join(' ') });
    }

    training.datum = req.body.datum;
    training.sportart = req.body.sportart;
    training.dauer = req.body.dauer;
    training.distanz = req.body.distanz !== undefined && req.body.distanz !== '' ? req.body.distanz : null;
    training.feelsLikeScore = req.body.feelsLikeScore;
    training.note = req.body.note || null;

    await training.save();
    res.json(training);
  } catch (err) {
    console.error('[trainingController] updateTraining error:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
}

// ── DELETE /api/training/:id ─────────────────────────────────────────────────

async function deleteTraining(req, res) {
  try {
    const training = await Trainingseinheit.findByPk(parseInt(req.params.id));
    if (!training) {
      return res.status(404).json({ message: 'Training nicht gefunden.' });
    }
    if (training.athletId !== req.user.id) {
      return res.status(403).json({ message: 'Keine Berechtigung.' });
    }

    await training.destroy();
    res.json({ message: 'Training erfolgreich gelöscht.' });
  } catch (err) {
    console.error('[trainingController] deleteTraining error:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
}

module.exports = {
  getStats,
  getAlleTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
};