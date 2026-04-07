/*
  Tests fuer trainingController.
  Fokus auf den CSV-Export-Endpunkt inklusive Headern und Fehler-Mapping.
*/

const trainingService = require('../../src/services/trainingService');
const trainingController = require('../../src/controllers/trainingController');

jest.mock('../../src/services/trainingService', () => ({
  trainingErfassen: jest.fn(),
  alleTrainings: jest.fn(),
  trainingAendern: jest.fn(),
  trainingLoeschen: jest.fn(),
  trainingStatistik: jest.fn(),
  exportiereDaten: jest.fn(),
}));

function createResponseMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('trainingController.exportiereTrainings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('liefert CSV mit Download-Headern', async () => {
    const req = {
      user: { id: 21 },
      query: { sportart: 'Laufen' },
    };
    const res = createResponseMock();

    const csv = 'Datum,Sportart,Dauer (min),Distanz (km),FeelsLike-Score,Notiz\n2026-04-01,Laufen,45,10.5,8,Test';
    trainingService.exportiereDaten.mockResolvedValue(csv);

    await trainingController.exportiereTrainings(req, res);

    expect(trainingService.exportiereDaten).toHaveBeenCalledWith(21, { sportart: 'Laufen' });
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="trainings.csv"');
    expect(res.send).toHaveBeenCalledWith(csv);
  });

  test('mapped fachliche Fehler als 4xx JSON-Antwort', async () => {
    const req = {
      user: { id: 21 },
      query: {},
    };
    const res = createResponseMock();

    const error = new Error('Ungueltiger Filter.');
    error.status = 400;
    trainingService.exportiereDaten.mockRejectedValue(error);

    await trainingController.exportiereTrainings(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Ungueltiger Filter.' });
  });

  test('liefert generischen 500-Fallback bei unerwarteten Fehlern', async () => {
    const req = {
      user: { id: 21 },
      query: {},
    };
    const res = createResponseMock();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    trainingService.exportiereDaten.mockRejectedValue(new Error('boom'));

    await trainingController.exportiereTrainings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Serverfehler' });

    consoleSpy.mockRestore();
  });
});
