/*
  Modell für Nutzerkonten (Athlet und Trainer).
  Enthält Rollen, Status und Passwort-Handling via bcrypt.
*/

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashPassword(value) {
  // Bereits gehashte Passwörter nur akzeptieren, wenn es ein valider bcrypt-Hash ist.
  if (typeof value === 'string') {
    try {
      bcrypt.getRounds(value);
      return value;
    } catch {
      // Kein valider Hash -> normal hashen.
    }
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
