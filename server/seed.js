const { sequelize, Athlet, Trainingseinheit } = require('./src/models');

const seedDaten = async () => {
  try {
    await sequelize.sync({ force: true }); // Tabellen frisch erstellen

    console.log('Datenbank bereinigt. Erstelle Test-Daten...');

    // 2. Test-Athleten für Rollen und Referenzen
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

    console.log(`${athleten.length} Nutzer (Athleten & Trainer) erfolgreich angelegt!`);

    // 3. Dummy-Trainingseinträge (verteilte Daten für Tests)
    const trainings = [
      {
        datum: '2026-01-15',
        sportart: 'Laufen',
        dauer: 45,
        distanz: 8.5,
        rpe: 6,
        note: 'Morgenlauf im Park',
        feelsLikeScore: 270,
        athletId: athleten[1].id,
      },
      {
        datum: '2026-01-18',
        sportart: 'Radfahren',
        dauer: 90,
        distanz: 35.0,
        rpe: 7,
        note: 'Intervall-Session',
        feelsLikeScore: 630,
        athletId: athleten[1].id,
      },
      {
        datum: '2025-12-05',
        sportart: 'Schwimmen',
        dauer: 60,
        distanz: 2.5,
        rpe: 5,
        note: 'Technikfokus',
        feelsLikeScore: 300,
        athletId: athleten[2].id,
      },
      {
        datum: '2025-11-28',
        sportart: 'Laufen',
        dauer: 50,
        distanz: 9.0,
        rpe: 8,
        note: 'Tempodauerlauf',
        feelsLikeScore: 400,
        athletId: athleten[3].id,
      },
      {
        datum: '2025-12-20',
        sportart: 'Laufen',
        dauer: 30,
        distanz: 5.0,
        rpe: 4,
        note: 'Regenerationslauf',
        feelsLikeScore: 120,
        athletId: athleten[3].id,
      },
      {
        datum: '2026-01-02',
        sportart: 'Radfahren',
        dauer: 120,
        distanz: 50.0,
        rpe: 6,
        note: 'Lockere Ausdauer',
        feelsLikeScore: 720,
        athletId: athleten[0].id,
      },
      {
        datum: '2025-10-10',
        sportart: 'Laufen',
        dauer: 55,
        distanz: 10.5,
        rpe: 7,
        note: 'Tempodauerlauf',
        feelsLikeScore: 385,
        athletId: athleten[2].id,
      },
    ];

    const erstellteTrainings = await Trainingseinheit.bulkCreate(trainings);
    console.log(`${erstellteTrainings.length} Trainings erfolgreich angelegt!`);
    process.exit();

  } catch (error) {
    console.error('Fehler beim Seeden:', error);
    process.exit(1);
  }
};

seedDaten();
