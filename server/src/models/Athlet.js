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
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashPassword(value) {
  // Bereits gehashte Passwoerter (bcrypt-Format) nicht erneut hashen.
  if (typeof value === 'string' && value.startsWith('$2')) {
    return value;
  }
  return bcrypt.hash(String(value), SALT_ROUNDS);
}

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
        user.passwortHash = await hashPassword(user.passwortHash);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwortHash')) {
        user.passwortHash = await hashPassword(user.passwortHash);
      }
    }
  }
});

// Instanz-Methode zum Prüfen des Passworts
Athlet.prototype.checkPassword = async function(enteredPassword) {
  if (!this.passwortHash) return false;
  return bcrypt.compare(String(enteredPassword), this.passwortHash);
};

module.exports = Athlet;
