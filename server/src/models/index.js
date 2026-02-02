const { sequelize } = require('../config/db');
const Athlet = require('./Athlet');
const Training = require('./Training');

// Beziehungen definieren (Associations)
Athlet.hasMany(Training, { foreignKey: 'athletId' });
Training.belongsTo(Athlet, { foreignKey: 'athletId' });

module.exports = {
  sequelize,
  Athlet,
  Training
};
