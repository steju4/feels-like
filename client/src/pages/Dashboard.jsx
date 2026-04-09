/*
  Dashboard mit Live-Statistik und visualisierten Diagrammen.
  Filter gelten für Kennzahlen, Diagramme und Aktivitätsliste.
*/

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import './Dashboard.css';

function formatDauer(minuten) {
  if (!minuten) return '0 min';
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function formatDatum(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDatumKurz(dateStr) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  });
}

function greetingLabel() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function StatCard({ title, value, helper, tone, loading }) {
  return (
    <article className={`dash-card dash-card-${tone}`}>
      <p className="dash-card-title">{title}</p>
      {loading ? <div className="dash-card-skeleton" /> : <p className="dash-card-value">{value}</p>}
      <p className="dash-card-helper">{helper}</p>
    </article>
  );
}

function ActivityItem({ training }) {
  return (
    <li className="activity-item">
      <div className="activity-main">
        <p className="activity-sport">{training.sportart}</p>
        <p className="activity-date">{formatDatum(training.datum)}</p>
      </div>
      <div className="activity-meta">
        <span>{training.distanz != null ? `${training.distanz} km` : '-'}</span>
        <span>{formatDauer(training.dauer)}</span>
        <span className="activity-rpe">FeelsLikeScore (RPE): {training.feelsLikeScore}</span>
      </div>
    </li>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentTrainings, setRecentTrainings] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [filterSportart, setFilterSportart] = useState('');
  const [filterZeitraum, setFilterZeitraum] = useState('');

  const fetchData = useCallback(async () => {
    const params = {};
    if (filterSportart) params.sportart = filterSportart;
    if (filterZeitraum) params.zeitraum = filterZeitraum;

    setFetchError('');
    setLoadingStats(true);
    setLoadingList(true);

    try {
      const [statsRes, listRes] = await Promise.all([
        api.get('/ranking/statistik', { params }),
        api.get('/training', { params }),
      ]);

      const letzteAktivitaeten = Array.isArray(listRes.data) ? listRes.data.slice(0, 5) : [];

      setStats(statsRes.data);
      setRecentTrainings(letzteAktivitaeten);
    } catch (err) {
      console.error('Dashboard Fehler:', err);
      setFetchError('Dashboard-Daten konnten nicht geladen werden. Bitte Seite neu laden.');
    } finally {
      setLoadingStats(false);
      setLoadingList(false);
    }
  }, [filterSportart, filterZeitraum]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sportHaeufigkeitData = useMemo(() => {
    if (!stats?.haeufigkeitProSportart) return [];
    return stats.haeufigkeitProSportart.map((eintrag) => ({
      sportart: eintrag.sportart,
      anzahl: Number(eintrag.count) || 0,
    }));
  }, [stats]);

  const feelsLikeChartData = useMemo(() => {
    if (!stats?.feelsLikeVerlauf) return [];
    return stats.feelsLikeVerlauf.map((eintrag, index) => ({
      datum: eintrag.datum,
      datumKurz: formatDatumKurz(eintrag.datum) || `T${index + 1}`,
      score: Number(eintrag.feelsLikeScore) || 0,
      sportart: eintrag.sportart || '',
    }));
  }, [stats]);

  const hatTrainings = (stats?.anzahlTrainings || 0) > 0;
  const zeitraumLabel = filterZeitraum ? `Letzte ${filterZeitraum} Tage` : 'Gesamter Zeitraum';

  return (
    <section className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-overline">{greetingLabel()}</p>
          <h1>{user?.name || 'Athlet'} - Trainingscockpit</h1>
          <p>Deine letzten Einheiten, aktuelle Form und die wichtigsten Kennzahlen auf einen Blick.</p>
        </div>
      </header>

      <section className="dashboard-filterbar">
        <label>
          Sportart
          <select value={filterSportart} onChange={(e) => setFilterSportart(e.target.value)}>
            <option value="">Alle</option>
            <option value="Laufen">Laufen</option>
            <option value="Radfahren">Radfahren</option>
            <option value="Schwimmen">Schwimmen</option>
          </select>
        </label>

        <label>
          Zeitraum
          <select value={filterZeitraum} onChange={(e) => setFilterZeitraum(e.target.value)}>
            <option value="">Gesamt</option>
            <option value="30">Letzte 30 Tage</option>
            <option value="90">Letzte 90 Tage</option>
            <option value="365">Letzte 365 Tage</option>
          </select>
        </label>

        {(filterSportart || filterZeitraum) && (
          <button
            type="button"
            className="dashboard-clear"
            onClick={() => {
              setFilterSportart('');
              setFilterZeitraum('');
            }}
          >
            Filter zurücksetzen
          </button>
        )}
      </section>

      {fetchError && <div className="activity-empty"><p>{fetchError}</p></div>}

      <section className="dashboard-cards">
        <StatCard
          title="Distanz"
          value={stats ? `${stats.gesamtDistanz} km` : '-'}
          helper="Gesamt"
          tone="blue"
          loading={loadingStats}
        />
        <StatCard
          title="Einheiten"
          value={stats ? stats.anzahlTrainings : '-'}
          helper={zeitraumLabel}
          tone="green"
          loading={loadingStats}
        />
        <StatCard
          title="Dauer"
          value={stats ? formatDauer(stats.gesamtDauer) : '-'}
          helper="Gesamt"
          tone="amber"
          loading={loadingStats}
        />
        <StatCard
          title="FeelsLikeScore (RPE)"
          value={stats ? `${stats.durchschnittFeelsLike} / 10` : '-'}
          helper="Durchschnitt"
          tone="berry"
          loading={loadingStats}
        />
      </section>

      <section className="dashboard-visuals">
        <article className="dashboard-visual-card">
          <div className="dashboard-visual-head">
            <h2>Trainings-Häufigkeit pro Sportart</h2>
            <span>{zeitraumLabel}</span>
          </div>

          {loadingStats ? (
            <div className="chart-loading">
              <span className="dash-spinner" aria-hidden="true" />
              <p>Lade Diagramm ...</p>
            </div>
          ) : !hatTrainings ? (
            <div className="chart-empty">Keine Trainingsdaten für den aktuellen Filter.</div>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sportHaeufigkeitData} margin={{ top: 8, right: 14, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe3d7" />
                  <XAxis dataKey="sportart" axisLine={false} tickLine={false} tick={{ fill: '#4b5f51', fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#4b5f51', fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value}`, 'Trainings']} />
                  <Bar dataKey="anzahl" name="Trainings" fill="#2c6e49" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article className="dashboard-visual-card">
          <div className="dashboard-visual-head">
            <h2>FeelsLike-Score Verlauf</h2>
            <span>{zeitraumLabel}</span>
          </div>

          {loadingStats ? (
            <div className="chart-loading">
              <span className="dash-spinner" aria-hidden="true" />
              <p>Lade Diagramm ...</p>
            </div>
          ) : !hatTrainings ? (
            <div className="chart-empty">Noch keine Trainings vorhanden.</div>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={feelsLikeChartData} margin={{ top: 8, right: 14, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbe3d7" />
                  <XAxis dataKey="datumKurz" axisLine={false} tickLine={false} tick={{ fill: '#4b5f51', fontSize: 12 }} />
                  <YAxis
                    domain={[1, 10]}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#4b5f51', fontSize: 12 }}
                  />
                  <Tooltip
                    labelFormatter={(_, payload) => {
                      const rawDate = payload?.[0]?.payload?.datum;
                      return rawDate ? formatDatum(rawDate) : '';
                    }}
                    formatter={(value) => [`${value} / 10`, 'FeelsLikeScore']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="FeelsLikeScore"
                    stroke="#7a2f5c"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-activities">
        <div className="dashboard-activities-head">
          <h2>Letzte Aktivitäten</h2>
          {!loadingList && <span>{recentTrainings.length} Einträge</span>}
        </div>

        {loadingList ? (
          <div className="activity-loading">Lade Aktivitäten ...</div>
        ) : recentTrainings.length === 0 ? (
          <div className="activity-empty">
            <p>Keine Trainings im aktuellen Filter.</p>
            <span>Wähle einen anderen Zeitraum oder eine andere Sportart.</span>
          </div>
        ) : (
          <ul className="activity-list">
            {recentTrainings.map((training) => (
              <ActivityItem key={training.id} training={training} />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
