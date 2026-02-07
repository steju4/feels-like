/*
  TODO: Training Model
  
  Hier definieren wir das Schema für eine Trainingseinheit.
  Wichtige Felder (basierend auf den Anforderungen):
  - date: Wann fand das Training statt?
  - type: Sportart (z.B. Laufen, Radfahren) - ggf. als Enum oder String
  - duration: Dauer in Minuten
  - rpe: Rate of Perceived Exertion (1-10)
  - feelsLikeScore: Der berechnete Wert (z.B. Duration * RPE)
  - note: Freitext Notiz
  - athletId: Verknüpfung zum User (Athlet)
*/

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Training = sequelize.define('Training', {
  // Datum der Einheit
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Sportart
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Dauer in Minuten
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  // Belastungsempfinden 1-10
  rpe: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
  // Optionaler Freitext
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Berechneter Score (z.B. duration * rpe)
  feelsLikeScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  // Zuordnung zum Athleten
  athletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Training;
