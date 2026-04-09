/*
  Rankingansicht für Trainer nach Sportart, Zeitraum und Metrik.
  Zeigt Top-Liste basierend auf den aktuellen Filterwerten.
*/

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
  { value: 'haeufigkeit', label: 'Anzahl Aktivitäten' },
  { value: 'dauer', label: 'Dauer (Minuten)' },
];

const Ranking = () => {
  const [daten, setDaten] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sportart, setSportart] = useState('alle');
  const [zeitraum, setZeitraum] = useState('30');
  const [metrik, setMetrik] = useState('distanz');

  // Label für Karten-/Tabellenköpfe
  const wertLabel = useMemo(() => {
    const m = metriken.find((item) => item.value === metrik);
    return m ? m.label : 'Wert';
  }, [metrik]);

  const formatWert = (wert, metrikKey = metrik) => {
    const num = Number(wert || 0);
    if (metrikKey === 'haeufigkeit') return `${num.toFixed(0)}`;
    if (metrikKey === 'dauer') return `${num.toFixed(0)} min`;
    return `${num.toFixed(2)} km`;
  };

  const statistik = useMemo(() => {
    // neutrale Defaults für leeren Zustand
    if (!daten.length) {
      return {
        anzahlAthleten: 0,
        anzahlAktivitaeten: 0,
        durchschnittMetrik: 0,
        topWert: 0,
      };
    }

    const anzahlAktivitaeten = daten.reduce((sum, eintrag) => {
      return sum + (Number(eintrag.metrics?.haeufigkeit) || 0);
    }, 0);

    const gesamtMetrik = daten.reduce((sum, eintrag) => {
      return sum + (Number(eintrag.wert) || 0);
    }, 0);

    return {
      anzahlAthleten: daten.length,
      anzahlAktivitaeten,
      durchschnittMetrik: gesamtMetrik / daten.length,
      topWert: Number(daten[0]?.wert) || 0,
    };
  }, [daten]);

  const formatDurchschnittProAktivitaet = (eintrag, metrikKey) => {
    const anzahl = Number(eintrag.metrics?.haeufigkeit) || 0;
    if (!anzahl) {
      return '-';
    }

    const gesamtWert = Number(eintrag.metrics?.[metrikKey]) || 0;
    const durchschnitt = gesamtWert / anzahl;

    if (metrikKey === 'dauer') {
      return `${durchschnitt.toFixed(1)} min`;
    }
    return `${durchschnitt.toFixed(2)} km`;
  };

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError('');
      try {
        // Neu laden bei jeder Änderung von Sportart, Zeitraum oder Metrik
        const response = await api.get('/ranking', {
          params: { sportart, zeitraum, metrik },
        });
        setDaten(response.data?.results || []);
      } catch (err) {
        const status = err.response?.status;
        if (status === 403) {
          setError('Rankinganalyse ist nur für Trainer verfügbar.');
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
        <p>Vergleiche Athletinnen und Athleten nach Distanz, Aktivitätsanzahl oder Dauer im gewählten Zeitraum.</p>
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
        <>
          <section className="ranking-summary-grid" aria-label="Ranking Überblick">
            <article className="ranking-summary-card">
              <p className="ranking-summary-label">Athlet/innen im Ranking</p>
              <p className="ranking-summary-value">{statistik.anzahlAthleten}</p>
            </article>
            <article className="ranking-summary-card">
              <p className="ranking-summary-label">Aktivitäten gesamt</p>
              <p className="ranking-summary-value">{statistik.anzahlAktivitaeten}</p>
            </article>
            <article className="ranking-summary-card">
              <p className="ranking-summary-label">Durchschnitt ({wertLabel})</p>
              <p className="ranking-summary-value">{formatWert(statistik.durchschnittMetrik)}</p>
            </article>
            <article className="ranking-summary-card">
              <p className="ranking-summary-label">Top-Wert ({wertLabel})</p>
              <p className="ranking-summary-value">{formatWert(statistik.topWert)}</p>
            </article>
          </section>

          <table className="ranking-table">
            <thead>
              <tr>
                <th>Platz</th>
                <th>Athlet/in</th>
                <th>{wertLabel}</th>
                <th>Aktivitäten</th>
                <th>Ø Distanz/Aktivität</th>
                <th>Ø Dauer/Aktivität</th>
              </tr>
            </thead>
            <tbody>
              {daten.length === 0 && (
                <tr>
                  <td colSpan="6">Keine Daten für die ausgewählten Filterkriterien.</td>
                </tr>
              )}
              {daten.map((eintrag, index) => (
                <tr key={eintrag.athletId || index}>
                  <td>{index + 1}.</td>
                  <td><strong>{eintrag.name}</strong></td>
                  <td>{formatWert(eintrag.wert)}</td>
                  <td>{formatWert(eintrag.metrics?.haeufigkeit, 'haeufigkeit')}</td>
                  <td>{formatDurchschnittProAktivitaet(eintrag, 'distanz')}</td>
                  <td>{formatDurchschnittProAktivitaet(eintrag, 'dauer')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Ranking;
