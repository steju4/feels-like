import { useState, useEffect, useCallback } from 'react';
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
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
  const [trainings, setTrainings] = useState([]);
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
        api.get('/training/stats', { params }),
        api.get('/training', { params }),
      ]);
      setStats(statsRes.data);
      setTrainings(listRes.data);
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
          <select value={filterSportart} onChange={e => setFilterSportart(e.target.value)}>
            <option value="">Alle</option>
            <option value="Laufen">Laufen</option>
            <option value="Radfahren">Radfahren</option>
            <option value="Schwimmen">Schwimmen</option>
          </select>
        </label>

        <label>
          Zeitraum
          <select value={filterZeitraum} onChange={e => setFilterZeitraum(e.target.value)}>
            <option value="">Gesamt</option>
            <option value="woche">Letzte 7 Tage</option>
            <option value="monat">Letzter Monat</option>
            <option value="quartal">Letztes Quartal</option>
            <option value="jahr">Letztes Jahr</option>
          </select>
        </label>

        {(filterSportart || filterZeitraum) && (
          <button type="button" className="dashboard-clear" onClick={() => {
            setFilterSportart('');
            setFilterZeitraum('');
          }}>
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
          helper="im Filter"
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

      <section className="dashboard-activities">
        <div className="dashboard-activities-head">
          <h2>Letzte Aktivitäten</h2>
          {!loadingList && <span>{trainings.length} Einträge</span>}
        </div>

        {loadingList ? (
          <div className="activity-loading">Lade Aktivitäten ...</div>
        ) : trainings.length === 0 ? (
          <div className="activity-empty">
            <p>Keine Trainings im aktuellen Filter.</p>
            <span>Wähle einen anderen Zeitraum oder eine andere Sportart.</span>
          </div>
        ) : (
          <ul className="activity-list">
            {trainings.map(training => (
              <ActivityItem key={training.id} training={training} />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
