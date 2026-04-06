/*
  Modell für einzelne Trainingseinheiten.
  Enthält Kerndaten wie Datum, Sportart, Dauer, Distanz, RPE und Athlet-Zuordnung.
*/

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Trainingseinheit = sequelize.define('Trainingseinheit', {
  // Datum der Einheit
  datum: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Sportart (z. B. Laufen, Radfahren, Schwimmen)
  sportart: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Dauer in Minuten
  dauer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  // Distanz in km (optional)
  distanz: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  // Optionaler Freitext
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Subjektive Belastung (RPE) auf Skala 1-10
  feelsLikeScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
  // Fremdschlüssel auf Athlet
  athletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'trainings',
});

module.exports = Trainingseinheit;
