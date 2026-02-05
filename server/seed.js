const { sequelize } = require('./src/config/db');
const Athlet = require('./src/models/Athlet');

const seedDaten = async () => {
  try {
    await sequelize.sync({ force: true }); // Alles bestehende löschen

    console.log('🌱 Datenbank bereinigt. Erstelle Test-Daten...');

    // 2. Test-Athleten
    const athleten = await Athlet.bulkCreate([
      {
        name: 'Julian Stengele', // Trainer
        email: 'julian@test.de',
        passwortHash: '123456',
        status: 'aktiv',
        role: 'trainer'
      },
      {
        name: 'Isabella Schwarz',
        email: 'isabella@test.de',
        passwortHash: 'geheim',
        status: 'aktiv',
        role: 'athlet'
      },
      {
        name: 'Sophie Lazarjan',
        email: 'sophie@test.de',
        passwortHash: 'geheim',
        status: 'inaktiv'
      },
      {
        name: 'Atussa Mehrawari',
        email: 'atussa@test.de',
        passwortHash: 'geheim',
        status: 'aktiv'
      }

    ], { individualHooks: true });

    console.log(`✅ ${athleten.length} Nutzer (Athleten & Trainer) erfolgreich angelegt!`);
    process.exit();

  } catch (error) {
    console.error('❌ Fehler beim Seeden:', error);
    process.exit(1);
  }
};

seedDaten();