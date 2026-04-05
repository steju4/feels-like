/*
  Bindet alle Modelle zusammen und definiert ihre Beziehungen.
*/

const { sequelize } = require('../config/db');
const Athlet = require('./Athlet');
const Trainingseinheit = require('./Trainingseinheit');

// Beziehungen definieren (Associations)
Athlet.hasMany(Trainingseinheit, { foreignKey: 'athletId' });
Trainingseinheit.belongsTo(Athlet, { foreignKey: 'athletId' });

module.exports = {
  sequelize,
  Athlet,
  Trainingseinheit
};
