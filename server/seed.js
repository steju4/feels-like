const { sequelize, Athlet, Trainingseinheit } = require('./src/models');

const seedDaten = async () => {
  try {
    await sequelize.sync({ force: true }); // Tabellen frisch erstellen

    console.log('Datenbank bereinigt. Erstelle Test-Daten...');

    // 2. Test-Nutzer für Rollen und Referenzen
    const nutzer = await Athlet.bulkCreate([
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
        status: 'aktiv',
        role: 'athlet'
      },
      {
        name: 'Atussa Mehrawari',
        email: 'atussa@test.de',
        passwortHash: 'geheim',
        status: 'aktiv',
        role: 'athlet'
      },
      {
        name: 'Joey Stoeckle',
        email: 'joey@test.de',
        passwortHash: 'geheim',
        status: 'aktiv',
        role: 'athlet'
      },
      {
        name: 'Simon Zweigler',
        email: 'simon@test.de',
        passwortHash: 'geheim',
        status: 'aktiv',
        role: 'athlet'
      },
      {
        name: 'Lena Berg',
        email: 'lena@test.de',
        passwortHash: 'geheim',
        status: 'aktiv',
        role: 'athlet'
      },
      {
        name: 'Max Kramer',
        email: 'max@test.de',
        passwortHash: 'geheim',
        status: 'aktiv',
        role: 'athlet'
      },
      {
        name: 'Nina Vollmer',
        email: 'nina@test.de',
        passwortHash: 'geheim',
        status: 'inaktiv',
        role: 'athlet'
      },
      {
        name: 'Fabio Neumann',
        email: 'fabio@test.de',
        passwortHash: 'geheim',
        status: 'aktiv',
        role: 'athlet'
      }
    ], { individualHooks: true });

    console.log(`${nutzer.length} Nutzer (Athleten & Trainer) erfolgreich angelegt!`);

    const nutzerByEmail = Object.fromEntries(
      nutzer.map((eintrag) => [eintrag.email, eintrag])
    );

    const athletId = (email) => nutzerByEmail[email].id;

    // 3. Dummy-Trainingseinträge (nur Athleten, keine Trainer-Aktivität)
    const trainings = [
      // Isabella
      {
        datum: '2026-04-08',
        sportart: 'Laufen',
        dauer: 52,
        distanz: 10.2,
        note: 'Intervalllauf am Abend',
        feelsLikeScore: 8,
        athletId: athletId('isabella@test.de'),
      },
      {
        datum: '2026-04-05',
        sportart: 'Schwimmen',
        dauer: 50,
        distanz: 2.1,
        note: 'Technik und Atmung',
        feelsLikeScore: 6,
        athletId: athletId('isabella@test.de'),
      },
      {
        datum: '2026-03-28',
        sportart: 'Radfahren',
        dauer: 95,
        distanz: 38.4,
        note: 'Grundlagenausdauer',
        feelsLikeScore: 6,
        athletId: athletId('isabella@test.de'),
      },
      {
        datum: '2026-02-14',
        sportart: 'Laufen',
        dauer: 42,
        distanz: 7.9,
        note: 'Lockerer Dauerlauf',
        feelsLikeScore: 5,
        athletId: athletId('isabella@test.de'),
      },

      // Sophie
      {
        datum: '2026-04-07',
        sportart: 'Laufen',
        dauer: 48,
        distanz: 9.4,
        note: 'Fahrtspiel',
        feelsLikeScore: 7,
        athletId: athletId('sophie@test.de'),
      },
      {
        datum: '2026-03-30',
        sportart: 'Radfahren',
        dauer: 88,
        distanz: 33.7,
        note: 'Leichte Anstiege',
        feelsLikeScore: 6,
        athletId: athletId('sophie@test.de'),
      },
      {
        datum: '2026-02-21',
        sportart: 'Schwimmen',
        dauer: 55,
        distanz: 2.4,
        note: 'Technikfokus',
        feelsLikeScore: 5,
        athletId: athletId('sophie@test.de'),
      },

      // Atussa
      {
        datum: '2026-04-06',
        sportart: 'Radfahren',
        dauer: 110,
        distanz: 44.8,
        note: 'GA1 mit Endbeschleunigung',
        feelsLikeScore: 8,
        athletId: athletId('atussa@test.de'),
      },
      {
        datum: '2026-03-26',
        sportart: 'Laufen',
        dauer: 36,
        distanz: 6.8,
        note: 'Regenerativ',
        feelsLikeScore: 4,
        athletId: athletId('atussa@test.de'),
      },
      {
        datum: '2026-03-11',
        sportart: 'Schwimmen',
        dauer: 62,
        distanz: 2.7,
        note: 'Lagen-Mix',
        feelsLikeScore: 6,
        athletId: athletId('atussa@test.de'),
      },

      // Joey
      {
        datum: '2026-04-04',
        sportart: 'Laufen',
        dauer: 60,
        distanz: 12.3,
        note: 'Langer Lauf',
        feelsLikeScore: 8,
        athletId: athletId('joey@test.de'),
      },
      {
        datum: '2026-03-22',
        sportart: 'Radfahren',
        dauer: 75,
        distanz: 31.2,
        note: 'Trittfrequenzfokus',
        feelsLikeScore: 6,
        athletId: athletId('joey@test.de'),
      },
      {
        datum: '2026-02-27',
        sportart: 'Schwimmen',
        dauer: 46,
        distanz: 1.9,
        note: 'Ruhiger Technikblock',
        feelsLikeScore: 5,
        athletId: athletId('joey@test.de'),
      },

      // Simon
      {
        datum: '2026-04-02',
        sportart: 'Radfahren',
        dauer: 130,
        distanz: 55.4,
        note: 'Lange Ausfahrt',
        feelsLikeScore: 7,
        athletId: athletId('simon@test.de'),
      },
      {
        datum: '2026-03-15',
        sportart: 'Laufen',
        dauer: 43,
        distanz: 8.1,
        note: 'Mittleres Tempo',
        feelsLikeScore: 5,
        athletId: athletId('simon@test.de'),
      },
      {
        datum: '2026-02-10',
        sportart: 'Radfahren',
        dauer: 92,
        distanz: 37.5,
        note: 'Rollentraining',
        feelsLikeScore: 7,
        athletId: athletId('simon@test.de'),
      },

      // Lena
      {
        datum: '2026-04-01',
        sportart: 'Schwimmen',
        dauer: 58,
        distanz: 2.6,
        note: 'Ausdauerblock',
        feelsLikeScore: 6,
        athletId: athletId('lena@test.de'),
      },
      {
        datum: '2026-03-09',
        sportart: 'Laufen',
        dauer: 39,
        distanz: 7.3,
        note: 'Nuechternlauf',
        feelsLikeScore: 5,
        athletId: athletId('lena@test.de'),
      },
      {
        datum: '2026-02-04',
        sportart: 'Radfahren',
        dauer: 84,
        distanz: 32.8,
        note: 'Stabi danach',
        feelsLikeScore: 6,
        athletId: athletId('lena@test.de'),
      },

      // Max
      {
        datum: '2026-04-03',
        sportart: 'Laufen',
        dauer: 47,
        distanz: 9.1,
        note: 'Progressiver Lauf',
        feelsLikeScore: 7,
        athletId: athletId('max@test.de'),
      },
      {
        datum: '2026-03-18',
        sportart: 'Schwimmen',
        dauer: 40,
        distanz: 1.7,
        note: 'Technik + Beine',
        feelsLikeScore: 4,
        athletId: athletId('max@test.de'),
      },
      {
        datum: '2026-01-25',
        sportart: 'Radfahren',
        dauer: 100,
        distanz: 41.0,
        note: 'Krafteinheiten am Berg',
        feelsLikeScore: 8,
        athletId: athletId('max@test.de'),
      },

      // Nina (inaktiv, nur Historie)
      {
        datum: '2025-12-18',
        sportart: 'Laufen',
        dauer: 34,
        distanz: 6.2,
        note: 'Letzte Einheit vor Pause',
        feelsLikeScore: 4,
        athletId: athletId('nina@test.de'),
      },

      // Fabio
      {
        datum: '2026-03-31',
        sportart: 'Radfahren',
        dauer: 72,
        distanz: 29.6,
        note: 'Cadence-Drills',
        feelsLikeScore: 6,
        athletId: athletId('fabio@test.de'),
      },
      {
        datum: '2026-02-16',
        sportart: 'Laufen',
        dauer: 44,
        distanz: 8.0,
        note: 'Schwellentraining',
        feelsLikeScore: 7,
        athletId: athletId('fabio@test.de'),
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
