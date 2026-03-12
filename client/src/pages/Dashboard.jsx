import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import './Dashboard.css';

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

function formatDauer(minuten) {
  if (!minuten) return '0 Min';
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  if (h === 0) return `${m} Min`;
  if (m === 0) return `${h} Std`;
  return `${h} Std ${m} Min`;
}

function formatDatum(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SPORTART_EMOJI = {
  Laufen: '🏃',
  Radfahren: '🚴',
  Schwimmen: '🏊',
};

const SPORTART_COLOR = {
  Laufen: '#e85d4a',
  Radfahren: '#4a9eca',
  Schwimmen: '#4acba8',
};

// ── Subkomponenten ───────────────────────────────────────────────────────────

function StatCard({ label, value, unit, icon, accent, loading }) {
  return (
    <div
      className="stat-card"
      style={{ '--accent': accent }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${accent}22`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div className="stat-card-accent" style={{ background: accent }} />
      <div className="stat-card-icon">{icon}</div>

      {loading ? (
        <div className="stat-card-skeleton" />
      ) : (
        <div className="stat-card-value-wrapper">
          <span className="stat-card-value">{value}</span>
          {unit && <span className="stat-card-unit">{unit}</span>}
        </div>
      )}

      <span className="stat-card-label">{label}</span>
    </div>
  );
}

function ActivityRow({ training }) {
  const color = SPORTART_COLOR[training.sportart] || '#888';
  const emoji = SPORTART_EMOJI[training.sportart] || '';

  return (
    <div className="activity-row">
      <div
        className="activity-icon-box"
        style={{ background: `${color}18`, border: `1px solid ${color}44` }}
      >
        {emoji}
      </div>

      <div>
        <div className="activity-name">{training.sportart}</div>
        <div className="activity-date">{formatDatum(training.datum)}</div>
      </div>

      <div>
        <div className="activity-distance" style={{ color }}>
          {training.distanz != null ? `${training.distanz} km` : '—'}
        </div>
        <div className="activity-duration">{formatDauer(training.dauer)}</div>
      </div>

      <div
        className="activity-rpe"
        style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}
      >
        {training.feelsLikeScore}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div className="skeleton-icon" />
      <div className="skeleton-content">
        <div className="skeleton-line-lg" />
        <div className="skeleton-line-sm" />
      </div>
    </div>
  );
}

// ── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  const [filterSportart, setFilterSportart] = useState('');
  const [filterZeitraum, setFilterZeitraum] = useState('');

  const fetchData = useCallback(async () => {
    const params = {};
    if (filterSportart) params.sportart = filterSportart;
    if (filterZeitraum) params.zeitraum = filterZeitraum;

    setLoadingStats(true);
    setLoadingList(true);

    try {
      const [statsRes, listRes] = await Promise.all([
        api.get('/api/training/stats', { params }),
        api.get('/api/training', { params }),
      ]);
      setStats(statsRes.data);
      setTrainings(listRes.data);
    } catch (err) {
      console.error('Dashboard Fehler:', err);
    } finally {
      setLoadingStats(false);
      setLoadingList(false);
    }
  }, [filterSportart, filterZeitraum]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Guten Morgen';
    if (h < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  return (
    <div className="dashboard-root">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <p className="dashboard-greeting">{greeting()}</p>
        <h1 className="dashboard-title">{user?.name || 'Athlet'} 👋</h1>
        <p className="dashboard-subtitle">Hier ist deine persönliche Trainingsübersicht</p>
      </div>

      {/* ── Filter-Leiste ── */}
      <div className="dashboard-filters">
        <select
          className="dashboard-select"
          value={filterSportart}
          onChange={e => setFilterSportart(e.target.value)}
        >
          <option value="">Alle Sportarten</option>
          <option value="Laufen">🏃 Laufen</option>
          <option value="Radfahren">🚴 Radfahren</option>
          <option value="Schwimmen">🏊 Schwimmen</option>
        </select>

        <select
          className="dashboard-select"
          value={filterZeitraum}
          onChange={e => setFilterZeitraum(e.target.value)}
        >
          <option value="">Gesamter Zeitraum</option>
          <option value="woche">Letzte 7 Tage</option>
          <option value="monat">Letzter Monat</option>
          <option value="quartal">Letztes Quartal</option>
          <option value="jahr">Letztes Jahr</option>
        </select>

        {(filterSportart || filterZeitraum) && (
          <button
            className="dashboard-reset-btn"
            onClick={() => { setFilterSportart(''); setFilterZeitraum(''); }}
          >
            ✕ Filter zurücksetzen
          </button>
        )}
      </div>

      {/* ── Statistik-Karten ── */}
      <div className="stats-grid">
        <StatCard
          label="Gesamtdistanz"
          value={stats ? stats.gesamtDistanz : '—'}
          unit="km"
          icon="📍"
          accent="#4a9eca"
          loading={loadingStats}
        />
        <StatCard
          label="Trainingseinheiten"
          value={stats ? stats.anzahlTrainings : '—'}
          unit="Sessions"
          icon="🗓️"
          accent="#4acba8"
          loading={loadingStats}
        />
        <StatCard
          label="Gesamtdauer"
          value={stats ? formatDauer(stats.gesamtDauer) : '—'}
          unit=""
          icon="⏱️"
          accent="#e8a04a"
          loading={loadingStats}
        />
        <StatCard
          label="Ø Feels Like"
          value={stats ? stats.durchschnittFeelsLike : '—'}
          unit="/ 10"
          icon="💪"
          accent="#c84acb"
          loading={loadingStats}
        />
      </div>

      {/* ── Letzte Aktivitäten ── */}
      <div className="activities-section">
        <div className="activities-header">
          <h2 className="activities-title">Letzte Aktivitäten</h2>
          {!loadingList && (
            <span className="activities-count">
              {trainings.length} {trainings.length === 1 ? 'Eintrag' : 'Einträge'}
            </span>
          )}
        </div>

        {/* Spalten-Header */}
        <div className="activities-columns">
          <div />
          <div>Aktivität</div>
          <div className="activities-column-right">Distanz / Dauer</div>
          <div className="activities-column-center">RPE</div>
        </div>

        <div className="activities-list">
          {loadingList ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : trainings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏁</div>
              <p className="empty-state-title">Keine Trainings gefunden</p>
              <p className="empty-state-subtitle">
                {filterSportart || filterZeitraum
                  ? 'Versuche andere Filtereinstellungen'
                  : 'Erfasse dein erstes Training!'}
              </p>
            </div>
          ) : (
            trainings.map(t => <ActivityRow key={t.id} training={t} />)
          )}
        </div>
      </div>

    </div>
  );
}
