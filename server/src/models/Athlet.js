/*
  TODO: Athlet Model
  
  Definiert den User (Sowohl Athlet als auch Trainer).
  Felder existieren bereits, aber müssen ggf. erweitert werden.
  Sicherstellen:
  - role: Unterscheidung zwischen 'trainer' und 'athlet' ist essenziell für die Rechte.
  - passwortHash: Sicher speichern (bcrypt).
*/

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');
const bcrypt = require('bcryptjs');

const Athlet = sequelize.define('Athlet', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  role: {
    type: DataTypes.ENUM('athlet', 'trainer'),
    defaultValue: 'athlet',
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwortHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwortHash = await bcrypt.hash(user.passwortHash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwortHash')) {
        const salt = await bcrypt.genSalt(10);
        user.passwortHash = await bcrypt.hash(user.passwortHash, salt);
      }
    }
  }
});

// Instanz-Methode zum Prüfen des Passworts
Athlet.prototype.checkPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwortHash);
};

module.exports = Athlet;