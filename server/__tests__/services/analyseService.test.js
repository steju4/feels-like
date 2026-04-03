const { berechneRanking } = require('../../src/services/analyseService');

describe('analyseService.berechneRanking', () => {
  const baseEntries = [
    {
      athletId: 1,
      name: 'A',
      metrics: { distanz: 20, haeufigkeit: 3, dauer: 120 },
    },
    {
      athletId: 2,
      name: 'B',
      metrics: { distanz: 15, haeufigkeit: 5, dauer: 100 },
    },
    {
      athletId: 3,
      name: 'C',
      metrics: { distanz: 25, haeufigkeit: 2, dauer: 150 },
    },
  ];

  test('sortiert nach Distanz absteigend', () => {
    const result = berechneRanking(baseEntries, 'distanz');

    expect(result.map((e) => e.athletId)).toEqual([3, 1, 2]);
    expect(result.map((e) => e.wert)).toEqual([25, 20, 15]);
  });

  test('sortiert nach Haeufigkeit absteigend', () => {
    const result = berechneRanking(baseEntries, 'haeufigkeit');

    expect(result.map((e) => e.athletId)).toEqual([2, 1, 3]);
    expect(result.map((e) => e.wert)).toEqual([5, 3, 2]);
  });

  test('sortiert nach Dauer absteigend', () => {
    const result = berechneRanking(baseEntries, 'dauer');

    expect(result.map((e) => e.athletId)).toEqual([3, 1, 2]);
    expect(result.map((e) => e.wert)).toEqual([150, 120, 100]);
  });

  test('faellt bei unbekannter Metrik auf Distanz zurueck', () => {
    const result = berechneRanking(baseEntries, 'unbekannt');

    expect(result.map((e) => e.athletId)).toEqual([3, 1, 2]);
  });

  test('mutiert das Eingabe-Array nicht', () => {
    const original = JSON.stringify(baseEntries);
    const copied = [...baseEntries];

    berechneRanking(copied, 'distanz');

    expect(JSON.stringify(baseEntries)).toBe(original);
  });
});
