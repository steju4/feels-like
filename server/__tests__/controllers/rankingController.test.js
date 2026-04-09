/*
  Tests für rankingController.
  Fokus auf den Dashboard-Statistik-Endpunkt (/api/ranking/statistik).
*/

const { Op } = require('sequelize');
const rankingController = require('../../src/controllers/rankingController');
const { Trainingseinheit } = require('../../src/models');

jest.mock('../../src/models', () => ({
  Athlet: {},
  Trainingseinheit: {
    findAll: jest.fn(),
  },
}));

jest.mock('../../src/services/analyseService', () => ({
  berechneRanking: jest.fn(),
}));

function createResponseMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function trainingRecord({ datum, sportart, distanz, dauer, feelsLikeScore }) {
  return {
    get: jest.fn().mockReturnValue({
      datum,
      sportart,
      distanz,
      dauer,
      feelsLikeScore,
    }),
  };
}

describe('rankingController.berechneStatistik', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('liefert 401 wenn kein authentifizierter Benutzer vorhanden ist', async () => {
    const req = { user: null, query: {} };
    const res = createResponseMock();

    await rankingController.berechneStatistik(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nicht authentifiziert.' });
    expect(Trainingseinheit.findAll).not.toHaveBeenCalled();
  });

  test('liefert Nullwerte und leere Verlaeufe ohne Trainingsdaten', async () => {
    const req = { user: { id: 4 }, query: {} };
    const res = createResponseMock();

    Trainingseinheit.findAll.mockResolvedValue([]);

    await rankingController.berechneStatistik(req, res);

    expect(Trainingseinheit.findAll).toHaveBeenCalledWith({
      attributes: ['datum', 'sportart', 'distanz', 'dauer', 'feelsLikeScore'],
      where: { athletId: 4 },
      order: [['datum', 'ASC'], ['id', 'ASC']],
    });

    expect(res.json).toHaveBeenCalledWith({
      gesamtDistanz: 0,
      gesamtDauer: 0,
      anzahlTrainings: 0,
      durchschnittFeelsLike: 0,
      sportartenVerteilung: {
        Laufen: 0,
        Radfahren: 0,
        Schwimmen: 0,
      },
      haeufigkeitProSportart: [
        { sportart: 'Laufen', count: 0 },
        { sportart: 'Radfahren', count: 0 },
        { sportart: 'Schwimmen', count: 0 },
      ],
      feelsLikeVerlauf: [],
    });
  });

  test('berechnet aggregierte Statistik mit Filtern korrekt', async () => {
    const req = {
      user: { id: 99 },
      query: { sportart: 'Laufen', zeitraum: '30' },
    };
    const res = createResponseMock();

    Trainingseinheit.findAll.mockResolvedValue([
      trainingRecord({
        datum: '2026-04-01',
        sportart: 'Laufen',
        distanz: '10.5',
        dauer: '50',
        feelsLikeScore: '8',
      }),
      trainingRecord({
        datum: '2026-04-03',
        sportart: 'Laufen',
        distanz: '5',
        dauer: '30',
        feelsLikeScore: '7',
      }),
    ]);

    await rankingController.berechneStatistik(req, res);

    const whereArg = Trainingseinheit.findAll.mock.calls[0][0].where;
    expect(whereArg).toEqual(expect.objectContaining({
      athletId: 99,
      sportart: 'Laufen',
    }));
    // Datum wird als gte-Filter gesetzt
    expect(whereArg.datum[Op.gte]).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    expect(res.json).toHaveBeenCalledWith({
      gesamtDistanz: 15.5,
      gesamtDauer: 80,
      anzahlTrainings: 2,
      durchschnittFeelsLike: 7.5,
      sportartenVerteilung: {
        Laufen: 2,
        Radfahren: 0,
        Schwimmen: 0,
      },
      haeufigkeitProSportart: [
        { sportart: 'Laufen', count: 2 },
        { sportart: 'Radfahren', count: 0 },
        { sportart: 'Schwimmen', count: 0 },
      ],
      feelsLikeVerlauf: [
        { datum: '2026-04-01', sportart: 'Laufen', feelsLikeScore: 8 },
        { datum: '2026-04-03', sportart: 'Laufen', feelsLikeScore: 7 },
      ],
    });
  });
});
