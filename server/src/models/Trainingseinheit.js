/*
  Trainingseinheit Model
  
  Definiert das Schema für eine Trainingseinheit.
  Felder (basierend auf dem Grobdesign):
  - datum: Wann fand das Training statt?
  - sportart: Sportart (z.B. Laufen, Radfahren, Schwimmen)
  - dauer: Dauer in Minuten
  - distanz: Zurückgelegte Distanz in km
  - feelsLikeScore: Subjektive Belastung (RPE) auf Skala 1-10
  - note: Freitext Notiz
  - athletId: Verknüpfung zum User (Athlet)
*/

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Trainingseinheit = sequelize.define('Trainingseinheit', {
  // Datum der Einheit
  datum: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Sportart
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
  // Distanz in km
  distanz: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  // Optionaler Freitext
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Belastungsempfinden als FeelsLikeScore (RPE) auf Skala 1-10
  feelsLikeScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
  // Zuordnung zum Athleten
  athletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'trainings',
});

module.exports = Trainingseinheit;
