/*
  Controller für die Rankinganalyse.
  Baut DB-Filter, aggregiert Trainingsdaten und delegiert das Sortieren an den analyseService.
*/

const { Op, fn, col } = require('sequelize');
const { Athlet, Trainingseinheit } = require('../models');
const { berechneRanking } = require('../services/analyseService');

const STATISTIK_SPORTARTEN = ['Laufen', 'Radfahren', 'Schwimmen'];

function formatDateOnlyLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseZeitraumTage(zeitraum) {
  if (!zeitraum) {
    return null;
  }

  const numerischeTage = parseInt(zeitraum, 10);
  if (!Number.isNaN(numerischeTage) && numerischeTage > 0) {
    return numerischeTage;
  }

  switch (zeitraum) {
    case 'woche':
      return 7;
    case 'monat':
      return 30;
    case 'quartal':
      return 90;
    case 'jahr':
      return 365;
    default:
      return null;
  }
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

exports.berechneStatistik = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Nicht authentifiziert.' });
    }

    const { zeitraum, sportart } = req.query;
    const where = { athletId: req.user.id };

    const zeitraumTage = parseZeitraumTage(zeitraum);
    if (zeitraumTage) {
      const start = new Date();
      start.setDate(start.getDate() - zeitraumTage);
      where.datum = { [Op.gte]: formatDateOnlyLocal(start) };
    }

    if (sportart && sportart.toLowerCase() !== 'alle') {
      where.sportart = sportart;
    }

    const trainings = await Trainingseinheit.findAll({
      attributes: ['datum', 'sportart', 'distanz', 'dauer', 'feelsLikeScore'],
      where,
      order: [['datum', 'ASC'], ['id', 'ASC']],
    });

    const sportartenVerteilung = STATISTIK_SPORTARTEN.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    if (trainings.length === 0) {
      return res.json({
        gesamtDistanz: 0,
        gesamtDauer: 0,
        anzahlTrainings: 0,
        durchschnittFeelsLike: 0,
        sportartenVerteilung,
        haeufigkeitProSportart: STATISTIK_SPORTARTEN.map((key) => ({
          sportart: key,
          count: 0,
        })),
        feelsLikeVerlauf: [],
      });
    }

    let gesamtDistanz = 0;
    let gesamtDauer = 0;
    let feelsLikeSumme = 0;

    const feelsLikeVerlauf = trainings.map((eintrag) => {
      const raw = eintrag.get({ plain: true });
      const distanz = Number.parseFloat(raw.distanz) || 0;
      const dauer = Number.parseInt(raw.dauer, 10) || 0;
      const feelsLikeScore = Number.parseInt(raw.feelsLikeScore, 10) || 0;

      gesamtDistanz += distanz;
      gesamtDauer += dauer;
      feelsLikeSumme += feelsLikeScore;

      if (raw.sportart) {
        if (sportartenVerteilung[raw.sportart] === undefined) {
          sportartenVerteilung[raw.sportart] = 0;
        }
        sportartenVerteilung[raw.sportart] += 1;
      }

      return {
        datum: raw.datum,
        sportart: raw.sportart,
        feelsLikeScore,
      };
    });

    const haeufigkeitProSportart = Object.entries(sportartenVerteilung).map(([name, count]) => ({
      sportart: name,
      count,
    }));

    return res.json({
      gesamtDistanz: Math.round(gesamtDistanz * 10) / 10,
      gesamtDauer,
      anzahlTrainings: trainings.length,
      durchschnittFeelsLike: Math.round((feelsLikeSumme / trainings.length) * 10) / 10,
      sportartenVerteilung,
      haeufigkeitProSportart,
      feelsLikeVerlauf,
    });
  } catch (error) {
    console.error('Fehler bei persönlicher Statistik:', error);
    return res.status(500).json({ message: 'Statistik konnte nicht berechnet werden.' });
  }
};
