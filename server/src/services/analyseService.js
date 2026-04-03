class DistanceStrategy {
  apply(entries) {
    return [...entries]
      .map((entry) => ({ ...entry, wert: entry.metrics.distanz }))
      .sort((a, b) => b.wert - a.wert);
  }
}

class FrequencyStrategy {
  apply(entries) {
    return [...entries]
      .map((entry) => ({ ...entry, wert: entry.metrics.haeufigkeit }))
      .sort((a, b) => b.wert - a.wert);
  }
}

class DurationStrategy {
  apply(entries) {
    return [...entries]
      .map((entry) => ({ ...entry, wert: entry.metrics.dauer }))
      .sort((a, b) => b.wert - a.wert);
  }
}

const strategies = {
  distanz: new DistanceStrategy(),
  haeufigkeit: new FrequencyStrategy(),
  dauer: new DurationStrategy(),
};

function chooseStrategy(key) {
  return strategies[key] || strategies.distanz;
}

function berechneRanking(entries, key) {
  const strategy = chooseStrategy(key);
  return strategy.apply(entries);
}

module.exports = {
  DistanceStrategy,
  FrequencyStrategy,
  DurationStrategy,
  berechneRanking,
  // Alias für bestehende Aufrufer
  rank: berechneRanking,
};
