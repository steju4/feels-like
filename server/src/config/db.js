/*
  Zentrale Sequelize-Konfiguration.
  Nutzt lokal SQLite als Dateidatenbank.
*/

const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite Konfiguration
// Datenbank wird als Datei im Ordner 'server' gespeichert
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'), 
  logging: false
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Datenbank erfolgreich verbunden!');
  } catch (error) {
    // Fehler loggen
    console.error('❌ Fehler bei der DB-Verbindung:', error);
  }
}

module.exports = { sequelize, connectDB };