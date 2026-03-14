/*
  Ranking Controller (AnalyseService)
  
  Logik für die Bestenlisten und Auswertungen.
  Funktionen:
  - berechneRanking: Alle User abrufen, FeelsLike-Scores summieren/berechnen, sortieren und zurückgeben.
  - berechneStatistik: Persönliche Statistiken für Charts.
*/

const { Op, fn, col } = require('sequelize');
const { Athlet, Trainingseinheit } = require('../models');
const { berechneRanking } = require('../services/analyseService');

exports.berechneRanking = async (req, res) => {
  try {
    if (req.user?.role !== 'trainer') {
      return res.status(403).json({ message: 'Rankinganalyse ist nur für Trainer verfügbar.' });
    }

    const { sportart = 'alle', zeitraum, metrik = 'distanz' } = req.query;

    const where = {};
    // Sportart-Filter nur setzen, wenn nicht "alle"
    if (sportart && sportart.toLowerCase() !== 'alle') {
      where.sportart = sportart;
    }

    if (zeitraum) {
      const tage = parseInt(zeitraum, 10);
      if (!Number.isNaN(tage) && tage > 0) {
        const start = new Date();
        start.setDate(start.getDate() - tage);
        where.datum = { [Op.gte]: start.toISOString().slice(0, 10) };
      }
    }

    const aggregiert = await Trainingseinheit.findAll({
      attributes: [
        'athletId',
        [fn('sum', col('distanz')), 'sumDistanz'],
        [fn('sum', col('dauer')), 'sumDauer'],
        [fn('count', col('Trainingseinheit.id')), 'anzahl'],
      ],
      where,
      include: [
        {
          model: Athlet,
          attributes: ['id', 'name', 'email'],
        },
      ],
      group: ['Trainingseinheit.athletId', 'Athlet.id', 'Athlet.name', 'Athlet.email'],
    });

    const daten = aggregiert.map((eintrag) => {
      const raw = eintrag.get({ plain: true });
      return {
        athletId: raw.athletId,
        name: raw.Athlet?.name || 'Unbekannt',
        email: raw.Athlet?.email,
        metrics: {
          distanz: Number(raw.sumDistanz) || 0,
          haeufigkeit: Number(raw.anzahl) || 0,
          dauer: Number(raw.sumDauer) || 0,
        },
      };
    });

    // Strategie auswählen und sortieren
    const ergebnis = berechneRanking(daten, metrik?.toLowerCase());
    res.json({ results: ergebnis });
  } catch (error) {
    console.error('Fehler beim Ranking:', error);
    res.status(500).json({ message: 'Ranking konnte nicht berechnet werden.' });
  }
};
