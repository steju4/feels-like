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

// Verfügbare Ranking-Strategien
const strategies = {
  distanz: new DistanceStrategy(),
  haeufigkeit: new FrequencyStrategy(),
  dauer: new DurationStrategy(),
};

function chooseStrategy(key) {
  return strategies[key] || strategies.distanz;
}

function rank(entries, key) {
  const strategy = chooseStrategy(key);
  return strategy.apply(entries);
}

module.exports = {
  DistanceStrategy,
  FrequencyStrategy,
  DurationStrategy,
  rank,
};
