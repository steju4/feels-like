/*
  Unit Tests – TrainingService (trainingService.js)

  Testfall-Mapping (gemäß Software Verification Plan):
  - TC-03 (analog): Unit Tests für Geschäftslogik-Funktionen
  - Äquivalenzklassentests für Validierung

  Testet die Funktionen der Kontrollklasse TrainingsVerwaltung:
    - validateTrainingsDaten()
    - trainingErfassen()
    - alleTrainings()
    - trainingAendern()
    - trainingLoeschen()

  Das Sequelize-Model "Trainingseinheit" wird gemockt,
  damit die Tests isoliert (ohne DB) laufen → echte Unit Tests.
*/

// --- Mock des Sequelize-Models (vor dem require!) ---
const mockCreate = jest.fn();
const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();

jest.mock('../../src/models/Trainingseinheit', () => ({
  create: mockCreate,
  findAll: mockFindAll,
  findByPk: mockFindByPk,
}));

const {
  validateTrainingsDaten,
  trainingErfassen,
  alleTrainings,
  trainingAendern,
  trainingLoeschen,
  trainingStatistik,
  ERLAUBTE_SPORTARTEN,
} = require('../../src/services/trainingService');

// --- Hilfsdaten ---
const gueltigeDaten = {
  datum: '2026-03-01',
  sportart: 'Laufen',
  dauer: 45,
  distanz: 10.5,
  feelsLikeScore: 7,
  note: 'Gutes Training',
};

// Reset mocks vor jedem Test
beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================
// 1. VALIDIERUNG – validateTrainingsDaten()
// ============================================================
describe('validateTrainingsDaten', () => {

  // --- Äquivalenzklasse: Gültige Eingaben ---
  describe('Gültige Eingaben (Normalfall)', () => {
    test('akzeptiert vollständige, gültige Daten', () => {
      const result = validateTrainingsDaten(gueltigeDaten);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('akzeptiert Daten ohne optionale Felder (distanz, note)', () => {
      const daten = {
        datum: '2026-03-01',
        sportart: 'Radfahren',
        dauer: 60,
        feelsLikeScore: 5,
      };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(true);
    });

    test('akzeptiert distanz = 0 (gültiger Wert)', () => {
      const daten = { ...gueltigeDaten, distanz: 0 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(true);
    });

    test('akzeptiert alle erlaubten Sportarten', () => {
      ERLAUBTE_SPORTARTEN.forEach((sportart) => {
        const daten = { ...gueltigeDaten, sportart };
        const result = validateTrainingsDaten(daten);
        expect(result.valid).toBe(true);
      });
    });

    test('akzeptiert feelsLikeScore am unteren Rand (1)', () => {
      const daten = { ...gueltigeDaten, feelsLikeScore: 1 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(true);
    });

    test('akzeptiert feelsLikeScore am oberen Rand (10)', () => {
      const daten = { ...gueltigeDaten, feelsLikeScore: 10 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(true);
    });
  });

  // --- Äquivalenzklasse: Pflichtfelder fehlen ---
  describe('Pflichtfelder fehlen', () => {
    test('lehnt ab wenn datum fehlt', () => {
      const daten = { ...gueltigeDaten, datum: undefined };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Datum ist ein Pflichtfeld.');
    });

    test('lehnt ab wenn sportart fehlt', () => {
      const daten = { ...gueltigeDaten, sportart: undefined };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Sportart ist ein Pflichtfeld.');
    });

    test('lehnt ab wenn dauer fehlt', () => {
      const daten = { ...gueltigeDaten, dauer: undefined };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dauer ist ein Pflichtfeld.');
    });

    test('lehnt ab wenn feelsLikeScore fehlt', () => {
      const daten = { ...gueltigeDaten, feelsLikeScore: undefined };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('FeelsLike-Score ist ein Pflichtfeld.');
    });

    test('lehnt ab wenn alle Pflichtfelder fehlen (4 Fehler)', () => {
      const result = validateTrainingsDaten({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });
  });

  // --- Äquivalenzklasse: Ungültige Werte ---
  describe('Ungültige Werte (Grenzfälle)', () => {
    test('lehnt ungültige Sportart ab', () => {
      const daten = { ...gueltigeDaten, sportart: 'Tanzen' };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Sportart muss eine der folgenden sein');
    });

    test('lehnt dauer = 0 ab', () => {
      const daten = { ...gueltigeDaten, dauer: 0 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dauer muss eine positive Zahl sein (> 0).');
    });

    test('lehnt negative dauer ab', () => {
      const daten = { ...gueltigeDaten, dauer: -10 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
    });

    test('lehnt negative distanz ab', () => {
      const daten = { ...gueltigeDaten, distanz: -5 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Distanz muss eine nicht-negative Zahl sein (>= 0).');
    });

    test('lehnt feelsLikeScore = 0 ab (unter Minimum)', () => {
      const daten = { ...gueltigeDaten, feelsLikeScore: 0 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
    });

    test('lehnt feelsLikeScore = 11 ab (über Maximum)', () => {
      const daten = { ...gueltigeDaten, feelsLikeScore: 11 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
    });

    test('lehnt feelsLikeScore als Dezimalzahl ab', () => {
      const daten = { ...gueltigeDaten, feelsLikeScore: 5.5 };
      const result = validateTrainingsDaten(daten);
      expect(result.valid).toBe(false);
    });
  });
});

// ============================================================
// 2. trainingErfassen()
// ============================================================
describe('trainingErfassen', () => {
  test('erstellt Training mit gültigen Daten', async () => {
    const mockTraining = { id: 1, ...gueltigeDaten, athletId: 42 };
    mockCreate.mockResolvedValue(mockTraining);

    const result = await trainingErfassen(42, gueltigeDaten);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        datum: '2026-03-01',
        sportart: 'Laufen',
        dauer: 45,
        distanz: 10.5,
        feelsLikeScore: 7,
        athletId: 42,
      })
    );
    expect(result).toEqual(mockTraining);
  });

  test('wirft Fehler 400 bei ungültigen Daten', async () => {
    try {
      await trainingErfassen(42, {});
      throw new Error('Sollte einen Fehler werfen');
    } catch (error) {
      expect(error.status).toBe(400);
      expect(error.message).toBeTruthy();
    }
  });

  test('setzt distanz auf null wenn nicht angegeben', async () => {
    const datenOhneDistanz = {
      datum: '2026-03-01',
      sportart: 'Schwimmen',
      dauer: 30,
      feelsLikeScore: 8,
    };
    mockCreate.mockResolvedValue({ id: 2, ...datenOhneDistanz, distanz: null, athletId: 1 });

    await trainingErfassen(1, datenOhneDistanz);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ distanz: null })
    );
  });
});

// ============================================================
// 3. alleTrainings()
// ============================================================
describe('alleTrainings', () => {
  test('lädt alle Trainings des Athleten', async () => {
    const mockList = [
      { id: 1, sportart: 'Laufen', athletId: 42 },
      { id: 2, sportart: 'Radfahren', athletId: 42 },
    ];
    mockFindAll.mockResolvedValue(mockList);

    const result = await alleTrainings(42);

    expect(mockFindAll).toHaveBeenCalledWith({
      where: { athletId: 42 },
      order: [['datum', 'DESC']],
    });
    expect(result).toEqual(mockList);
    expect(result).toHaveLength(2);
  });

  test('gibt leeres Array zurück wenn keine Trainings existieren', async () => {
    mockFindAll.mockResolvedValue([]);

    const result = await alleTrainings(99);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});

// ============================================================
// 4. trainingAendern()
// ============================================================
describe('trainingAendern', () => {
  test('aktualisiert Training mit gültigen Daten', async () => {
    const mockTraining = {
      id: 1,
      athletId: 42,
      datum: '2026-02-01',
      sportart: 'Laufen',
      dauer: 30,
      feelsLikeScore: 5,
      save: jest.fn().mockResolvedValue(true),
    };
    mockFindByPk.mockResolvedValue(mockTraining);

    const neueDaten = {
      datum: '2026-03-01',
      sportart: 'Radfahren',
      dauer: 60,
      distanz: 25,
      feelsLikeScore: 9,
      note: 'Super Tour',
    };

    const result = await trainingAendern(1, 42, neueDaten);

    expect(mockFindByPk).toHaveBeenCalledWith(1);
    expect(mockTraining.save).toHaveBeenCalled();
    expect(result.sportart).toBe('Radfahren');
    expect(result.dauer).toBe(60);
  });

  test('wirft 404 wenn Training nicht existiert', async () => {
    mockFindByPk.mockResolvedValue(null);

    try {
      await trainingAendern(999, 42, gueltigeDaten);
      throw new Error('Sollte einen Fehler werfen');
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.message).toContain('nicht gefunden');
    }
  });

  test('wirft 403 wenn Training einem anderen Athleten gehört', async () => {
    const mockTraining = {
      id: 1,
      athletId: 99, // gehört Athlet 99, aber Athlet 42 will ändern
    };
    mockFindByPk.mockResolvedValue(mockTraining);

    try {
      await trainingAendern(1, 42, gueltigeDaten);
      throw new Error('Sollte einen Fehler werfen');
    } catch (error) {
      expect(error.status).toBe(403);
      expect(error.message).toContain('Keine Berechtigung');
    }
  });

  test('wirft 400 bei ungültigen neuen Daten', async () => {
    const mockTraining = {
      id: 1,
      athletId: 42,
    };
    mockFindByPk.mockResolvedValue(mockTraining);

    try {
      await trainingAendern(1, 42, { sportart: 'Tanzen' });
      throw new Error('Sollte einen Fehler werfen');
    } catch (error) {
      expect(error.status).toBe(400);
    }
  });
});

// ============================================================
// 5. trainingLoeschen()
// ============================================================
describe('trainingLoeschen', () => {
  test('löscht Training erfolgreich', async () => {
    const mockTraining = {
      id: 1,
      athletId: 42,
      destroy: jest.fn().mockResolvedValue(true),
    };
    mockFindByPk.mockResolvedValue(mockTraining);

    await trainingLoeschen(1, 42);

    expect(mockFindByPk).toHaveBeenCalledWith(1);
    expect(mockTraining.destroy).toHaveBeenCalled();
  });

  test('wirft 404 wenn Training nicht existiert', async () => {
    mockFindByPk.mockResolvedValue(null);

    try {
      await trainingLoeschen(999, 42);
      throw new Error('Sollte einen Fehler werfen');
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });

  test('wirft 403 wenn Training einem anderen Athleten gehört', async () => {
    const mockTraining = {
      id: 1,
      athletId: 99, // gehört Athlet 99
    };
    mockFindByPk.mockResolvedValue(mockTraining);

    try {
      await trainingLoeschen(1, 42);
      throw new Error('Sollte einen Fehler werfen');
    } catch (error) {
      expect(error.status).toBe(403);
      expect(error.message).toContain('Keine Berechtigung');
    }
  });
});

// ============================================================
// 6. trainingStatistik()
// ============================================================
describe('trainingStatistik', () => {
  test('gibt Nullwerte zurueck wenn keine Trainings vorhanden sind', async () => {
    mockFindAll.mockResolvedValue([]);

    const result = await trainingStatistik(42);

    expect(result).toEqual({
      gesamtDistanz: 0,
      anzahlTrainings: 0,
      gesamtDauer: 0,
      durchschnittFeelsLike: 0,
    });
  });

  test('berechnet Summen und rundet Distanz sowie Durchschnitt korrekt', async () => {
    mockFindAll.mockResolvedValue([
      { distanz: '10.04', dauer: '60', feelsLikeScore: '7' },
      { distanz: '5.01', dauer: '30', feelsLikeScore: '8' },
      { distanz: null, dauer: 15, feelsLikeScore: 6 },
    ]);

    const result = await trainingStatistik(42);

    expect(result).toEqual({
      gesamtDistanz: 15.1,
      anzahlTrainings: 3,
      gesamtDauer: 105,
      durchschnittFeelsLike: 7,
    });
  });

  test('uebergibt Filter aus buildWhereClause an findAll', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-03T12:00:00'));
    mockFindAll.mockResolvedValue([]);

    await trainingStatistik(42, { sportart: 'Laufen', zeitraum: 'woche' });

    expect(mockFindAll).toHaveBeenCalledWith({
      where: expect.objectContaining({
        athletId: 42,
        sportart: 'Laufen',
        datum: expect.any(Object),
      }),
    });

    const whereArg = mockFindAll.mock.calls[0][0].where;
    const opSymbols = Object.getOwnPropertySymbols(whereArg.datum);
    expect(opSymbols).toHaveLength(1);
    expect(whereArg.datum[opSymbols[0]]).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    jest.useRealTimers();
  });
});
