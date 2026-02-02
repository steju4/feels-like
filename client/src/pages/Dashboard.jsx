import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; 
import './Dashboard.css';

const Dashboard = () => {
  const [serverStatus, setServerStatus] = useState(null);

  // Test-Aufruf an das Backend beim Laden der Seite
  useEffect(() => {
    // API Call anpassen, falls /test nicht mehr existiert oder geschützt ist.
    api.get('/') 
      .then(response => {
        setServerStatus({ message: 'Verbunden' });
      })
      .catch(error => {
        console.error("API Fehler:", error);
        setServerStatus({ message: 'Server nicht erreichbar ❌', info: 'Ist das Backend gestartet?' });
      });
  }, []);

  return (
    <div className="dashboard-container">
      
      {/* SYSTEM STATUS CHECK (Nur für Dev) */}
      <div style={{ 
        background: serverStatus?.message === 'Verbunden' ? '#e8f5e9' : '#ffebee', 
        padding: '10px', 
        borderRadius: '8px', 
        border: '1px dashed #ccc',
        marginBottom: '1rem',
        fontSize: '0.9rem'
      }}>
        <strong>System Status:</strong> {serverStatus ? serverStatus.message : 'Verbinde...'} 
      </div>

      {/* 1. Hero / Welcome Area */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Guten Morgen, Athlet! 👋</h1>
          <p>Bereit, deine Performance heute auf das nächste Level zu heben?</p>
        </div>
        <div className="hero-action">
          <Link to="/training" className="btn-primary">
            + Training erfassen
          </Link>
        </div>
      </section>

      {/* 2. Key Stats Grid */}
      <section className="stats-grid">
        {/* Card: Weekly Goal */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Wochenziel (Laufen)</span>
            <div className="stat-icon">🏃</div>
          </div>
          <div className="stat-value">32 km</div>
          <div className="stat-subtext">von 50 km erreicht</div>
          <div className="progress-container">
            <div className="progress-bar" style={{width: '64%'}}></div>
          </div>
        </div>

        {/* Card: Streak */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Dein Streak</span>
            <div className="stat-icon">🔥</div>
          </div>
          <div className="stat-value">5 Tage</div>
          <div className="stat-subtext">
            <strong>Super!</strong> Bleib dran.
          </div>
        </div>

        {/* Card: Ranking */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Team Ranking</span>
            <div className="stat-icon">🏆</div>
          </div>
          <div className="stat-value">#3</div>
          <div className="stat-subtext">
            Top 10% im Team
          </div>
        </div>
      </section>

      {/* 3. Recent Activity (Placeholder list) */}
      <section className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Letzte Aktivitäten</h2>
          <Link to="/training" className="view-all">Alle anzeigen →</Link>
        </div>
        
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🏃‍♂️</div>
            <div className="activity-details">
              <span className="activity-title">Laufen am Morgen</span>
              <span className="activity-date">Heute, 07:30 Uhr</span>
            </div>
            <div className="activity-value">10.5 km</div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">🚴</div>
            <div className="activity-details">
              <span className="activity-title">Rennrad Tour</span>
              <span className="activity-date">Gestern, 14:00 Uhr</span>
            </div>
            <div className="activity-value">45 km</div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">🏊‍♂️</div>
            <div className="activity-details">
              <span className="activity-title">Schwimmtraining</span>
              <span className="activity-date">Montag, 18:00 Uhr</span>
            </div>
            <div className="activity-value">2.5 km</div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
