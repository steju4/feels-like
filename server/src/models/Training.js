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
  // Platzhalter für Feld-Definitionen
});

module.exports = Training;
