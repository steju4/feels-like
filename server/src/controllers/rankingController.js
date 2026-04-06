/*
  Controller für die Rankinganalyse.
  Baut DB-Filter, aggregiert Trainingsdaten und delegiert das Sortieren an den analyseService.
*/

const { Op, fn, col } = require('sequelize');
const { Athlet, Trainingseinheit } = require('../models');
const { berechneRanking } = require('../services/analyseService');

function formatDateOnlyLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

exports.berechneRanking = async (req, res) => {
  try {
    // Defensive Prüfung, auch wenn die Route bereits requireRole nutzt
    if (req.user?.role !== 'trainer') {
      return res.status(403).json({ message: 'Rankinganalyse ist nur für Trainer verfügbar.' });
    }

    const { sportart = 'alle', zeitraum, metrik = 'distanz' } = req.query;

    const where = {};
    // Sportart nur filtern, wenn nicht explizit "alle"
    if (sportart && sportart.toLowerCase() !== 'alle') {
      where.sportart = sportart;
    }

    if (zeitraum) {
      const tage = parseInt(zeitraum, 10);
      if (!Number.isNaN(tage) && tage > 0) {
        const start = new Date();
        start.setDate(start.getDate() - tage);
        // Filter ab Startdatum (inklusive)
        where.datum = { [Op.gte]: formatDateOnlyLocal(start) };
      }
    }

    // Aggregation pro Athlet: Distanzsumme, Dauersumme, Anzahl
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
          attributes: ['id', 'name'],
        },
      ],
      group: ['Trainingseinheit.athletId', 'Athlet.id', 'Athlet.name'],
    });

    const daten = aggregiert.map((eintrag) => {
      const raw = eintrag.get({ plain: true });
      return {
        athletId: raw.athletId,
        name: raw.Athlet?.name || 'Unbekannt',
        // Rohwerte für die Strategy-Auswahl im analyseService
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
