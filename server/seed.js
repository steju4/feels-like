const { sequelize, Athlet, Training } = require('./src/models');

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

    ]);

    console.log(`${athleten.length} Nutzer (Athleten & Trainer) erfolgreich angelegt!`);

    // 3. Dummy-Trainingseinträge (verteilte Daten für Tests)
    const trainings = [
      {
        date: '2026-01-15',
        type: 'Laufen',
        duration: 45,
        rpe: 6,
        note: 'Morgenlauf im Park',
        feelsLikeScore: 45 * 6,
        athletId: athleten[1].id, 
      },
      {
        date: '2026-01-18',
        type: 'Radfahren',
        duration: 90,
        rpe: 7,
        note: 'Intervall-Session',
        feelsLikeScore: 90 * 7,
        athletId: athleten[1].id,
      },
      {
        date: '2025-12-05',
        type: 'Schwimmen',
        duration: 60,
        rpe: 5,
        note: 'Technikfokus',
        feelsLikeScore: 60 * 5,
        athletId: athleten[2].id, 
      },
      {
        date: '2025-11-28',
        type: 'Krafttraining',
        duration: 50,
        rpe: 8,
        note: 'Beine & Core',
        feelsLikeScore: 50 * 8,
        athletId: athleten[3].id, 
      },
      {
        date: '2025-12-20',
        type: 'Laufen',
        duration: 30,
        rpe: 4,
        note: 'Regenerationslauf',
        feelsLikeScore: 30 * 4,
        athletId: athleten[3].id,
      },
      {
        date: '2026-01-02',
        type: 'Radfahren',
        duration: 120,
        rpe: 6,
        note: 'Lockere Ausdauer',
        feelsLikeScore: 120 * 6,
        athletId: athleten[0].id,
      },
      {
        date: '2025-10-10',
        type: 'Laufen',
        duration: 55,
        rpe: 7,
        note: 'Tempodauerlauf',
        feelsLikeScore: 55 * 7,
        athletId: athleten[2].id,
      },
    ];

    const createdTrainings = await Training.bulkCreate(trainings); // Trainings speichern
    console.log(`${createdTrainings.length} Trainings erfolgreich angelegt!`);
    process.exit();

  } catch (error) {
    console.error('Fehler beim Seeden:', error);
    process.exit(1);
  }
};

seedDaten();
