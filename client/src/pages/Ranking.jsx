import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import './Ranking.css';

const sportarten = [
  { value: 'alle', label: 'Alle Sportarten' },
  { value: 'Laufen', label: 'Laufen' },
  { value: 'Radfahren', label: 'Radfahren' },
  { value: 'Schwimmen', label: 'Schwimmen' },
];

const zeitraeume = [
  { value: '30', label: 'Letzte 30 Tage' },
  { value: '90', label: 'Letzte 90 Tage' },
  { value: '365', label: 'Letzte 365 Tage' },
];

const metriken = [
  { value: 'distanz', label: 'Distanz (km)' },
  { value: 'haeufigkeit', label: 'Häufigkeit' },
  { value: 'dauer', label: 'Dauer (Minuten)' },
];

const Ranking = () => {
  const [daten, setDaten] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sportart, setSportart] = useState('alle');
  const [zeitraum, setZeitraum] = useState('30');
  const [metrik, setMetrik] = useState('distanz');

  const wertLabel = useMemo(() => {
    const m = metriken.find((item) => item.value === metrik);
    return m ? m.label : 'Wert';
  }, [metrik]);

  const formatWert = (wert) => {
    const num = Number(wert || 0);
    if (metrik === 'haeufigkeit') return `${num.toFixed(0)}x`;
    if (metrik === 'dauer') return `${num.toFixed(0)} min`;
    return `${num.toFixed(2)} km`;
  };

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/ranking', {
          params: { sportart, zeitraum, metrik },
        });
        setDaten(response.data?.results || []);
      } catch (err) {
        const status = err.response?.status;
        if (status === 403) {
          setError('Rankinganalyse ist nur fuer Trainer verfuegbar.');
        } else {
          setError('Ranking konnte nicht geladen werden.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [sportart, zeitraum, metrik]);

  return (
    <div className="ranking-container">
      <header className="ranking-hero">
        <h1>Rankinganalyse</h1>
        <p>Vergleiche Athletinnen und Athleten nach Distanz, Häufigkeit oder Dauer im gewählten Zeitraum.</p>
      </header>

      <div className="ranking-filters">
        <label>
          Sportart
          <select value={sportart} onChange={(e) => setSportart(e.target.value)}>
            {sportarten.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label>
          Zeitraum
          <select value={zeitraum} onChange={(e) => setZeitraum(e.target.value)}>
            {zeitraeume.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>

        <label>
          Metrik
          <select value={metrik} onChange={(e) => setMetrik(e.target.value)}>
            {metriken.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <div className="ranking-status">Lade Ranking...</div>}
      {error && <div className="ranking-status error">{error}</div>}

      {!loading && !error && (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>Platz</th>
              <th>Athlet/in</th>
              <th>{wertLabel}</th>
            </tr>
          </thead>
          <tbody>
            {daten.length === 0 && (
              <tr>
                <td colSpan="3">Keine Daten für die ausgewählten Filterkriterien.</td>
              </tr>
            )}
            {daten.map((eintrag, index) => (
              <tr key={eintrag.athletId || index}>
                <td>{index + 1}.</td>
                <td><strong>{eintrag.name}</strong></td>
                <td>{formatWert(eintrag.wert)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Ranking;
