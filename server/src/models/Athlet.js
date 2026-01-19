const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');

const Athlet = sequelize.define('Athlet', {
  // Attribute aus deinem Grobdesign
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Jede Email darf es nur einmal geben
    validate: {
      isEmail: true,
    },
  },
  passwortHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('eingeladen', 'aktiv', 'inaktiv'),
    defaultValue: 'eingeladen',
  },
});

module.exports = Athlet;