/*
  Seite für Trainingsverwaltung.
  Einträge erfassen, bearbeiten, löschen und als Tabelle anzeigen.
*/

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './TrainingForm.css';

// Erlaubte Sportarten gleich wie im Backend
const SPORTARTEN = ['Laufen', 'Radfahren', 'Schwimmen'];

// Ausgangszustand fürs Formular
const LEERES_FORMULAR = {
  datum: '',
  sportart: '',
  dauer: '',
  distanz: '',
  feelsLikeScore: 5,
  note: '',
};

export default function TrainingForm() {
  // State
  const [trainings, setTrainings] = useState([]);
  const [formData, setFormData] = useState({ ...LEERES_FORMULAR });
  const [editId, setEditId] = useState(null); // null = neu, ID = bearbeiten
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState([]);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [exportSportart, setExportSportart] = useState('');
  const [exporting, setExporting] = useState(false);

  // Beim Start vorhandene Trainings laden
  useEffect(() => {
    ladeTrainings();
  }, []);

  // Erfolgsmeldung nach kurzer Zeit ausblenden
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Eigene Trainings laden
  const ladeTrainings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/training');
      setTrainings(response.data);
    } catch {
      setServerError('Trainings konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  // Client-seitige Validierung
  const validateForm = () => {
    const validationErrors = [];

    if (!formData.datum) {
      validationErrors.push('Datum ist ein Pflichtfeld.');
    }
    if (!formData.sportart) {
      validationErrors.push('Sportart ist ein Pflichtfeld.');
    }
    if (!formData.dauer || Number(formData.dauer) <= 0) {
      validationErrors.push('Dauer muss größer als 0 sein.');
    }
    if (formData.distanz !== '' && formData.distanz !== null && formData.distanz !== undefined) {
      if (Number(formData.distanz) < 0) {
        validationErrors.push('Distanz darf nicht negativ sein.');
      }
    }
    if (!formData.feelsLikeScore || Number(formData.feelsLikeScore) < 1 || Number(formData.feelsLikeScore) > 10) {
      validationErrors.push('FeelsLikeScore (RPE) muss zwischen 1 und 10 liegen.');
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  // Formularfelder aktualisieren
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Absenden: neu anlegen oder vorhandenes Training aktualisieren
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    try {
      if (editId) {
        // Vorhandenen Eintrag aktualisieren
        await api.put(`/training/${editId}`, formData);
        setSuccessMsg('Trainingseinheit erfolgreich aktualisiert.');
      } else {
        // Neuen Eintrag anlegen
        await api.post('/training', formData);
        setSuccessMsg('Trainingseinheit erfolgreich erfasst.');
      }

      // Dann zurücksetzen und Tabelle aktualisieren
      resetForm();
      ladeTrainings();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Fehler beim Speichern.');
    }
  };

  // Edit-Modus aktivieren und vorhandene Daten ins Formular laden
  const handleEdit = (training) => {
    setEditId(training.id);
    setFormData({
      datum: training.datum,
      sportart: training.sportart,
      dauer: training.dauer,
      distanz: training.distanz !== null ? training.distanz : '',
      feelsLikeScore: training.feelsLikeScore,
      note: training.note || '',
    });
    setShowForm(true);
    setErrors([]);
    setServerError('');
    setSuccessMsg('');
    // Nutzer direkt zum Formular bringen
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Erst nur bestätigen lassen
  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  // Nach Bestätigung endgültig löschen
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/training/${deleteConfirmId}`);
      setSuccessMsg('Trainingseinheit erfolgreich gelöscht.');
      setDeleteConfirmId(null);
      ladeTrainings();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Fehler beim Löschen.');
      setDeleteConfirmId(null);
    }
  };

  // Trainingsdaten als CSV herunterladen
  const handleExport = async () => {
    setServerError('');
    setSuccessMsg('');
    setExporting(true);

    try {
      const response = await api.get('/training/export', {
        params: exportSportart ? { sportart: exportSportart } : {},
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'text/csv',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'trainings.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessMsg('CSV-Export wurde gestartet.');
    } catch (err) {
      const serverMessage = typeof err.response?.data?.message === 'string'
        ? err.response.data.message
        : '';
      setServerError(serverMessage || 'CSV-Export fehlgeschlagen.');
    } finally {
      setExporting(false);
    }
  };

  // Formularzustand zurücksetzen
  const resetForm = () => {
    setFormData({ ...LEERES_FORMULAR });
    setEditId(null);
    setShowForm(false);
    setErrors([]);
    setServerError('');
  };

  // UI-Icons für Sportarten
  const sportartIcon = (sportart) => {
    switch (sportart) {
      case 'Laufen': return '🏃';
      case 'Radfahren': return '🚴';
      case 'Schwimmen': return '🏊';
      default: return '🏋️';
    }
  };

  const formatDatum = (datum) => {
    if (!datum) return '';
    const d = new Date(datum);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Render
  return (
    <div className="training-page">
      <div className="training-header">
        <div>
          <h1>Meine Trainingseinheiten</h1>
          <p className="training-subtitle">Verwalte deine Trainings – erfassen, bearbeiten und löschen.</p>
        </div>
        <div className="training-header-actions">
          {trainings.length > 0 && (
            <div className="export-controls">
              <label htmlFor="exportSportart">Export-Filter</label>
              <select
                id="exportSportart"
                value={exportSportart}
                onChange={(e) => setExportSportart(e.target.value)}
                disabled={exporting}
              >
                <option value="">Alle Sportarten</option>
                {SPORTARTEN.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn-secondary export-btn"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? 'Export läuft...' : '📥 Als CSV exportieren'}
              </button>
            </div>
          )}

          {!showForm && (
            <button
              className="btn-primary"
              onClick={() => { setShowForm(true); setEditId(null); setFormData({ ...LEERES_FORMULAR }); }}
            >
              + Training erfassen
            </button>
          )}
        </div>
      </div>

      {/* Erfolgsmeldung */}
      {successMsg && (
        <div className="alert alert-success">
          {successMsg}
        </div>
      )}

      {/* Fehler vom Backend */}
      {serverError && (
        <div className="alert alert-error">
          {serverError}
        </div>
      )}

      {/* Formular für Neu/Ändern */}
      {showForm && (
        <div className="training-form-card">
          <h2>{editId ? 'Training bearbeiten' : 'Neues Training erfassen'}</h2>

          {/* Validierungsfehler */}
          {errors.length > 0 && (
            <div className="alert alert-error">
              <ul>
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="training-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="datum">Datum *</label>
                <input
                  type="date"
                  id="datum"
                  name="datum"
                  value={formData.datum}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sportart">Sportart *</label>
                <select
                  id="sportart"
                  name="sportart"
                  value={formData.sportart}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Bitte wählen —</option>
                  {SPORTARTEN.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dauer">Dauer (Min) *</label>
                <input
                  type="number"
                  id="dauer"
                  name="dauer"
                  value={formData.dauer}
                  onChange={handleChange}
                  min="1"
                  placeholder="z.B. 45"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="distanz">Distanz (km)</label>
                <input
                  type="number"
                  id="distanz"
                  name="distanz"
                  value={formData.distanz}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="z.B. 10.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="feelsLikeScore">FeelsLikeScore (RPE) (1-10) *</label>
                <div className="score-input-wrapper">
                  <input
                    type="range"
                    id="feelsLikeScore"
                    name="feelsLikeScore"
                    min="1"
                    max="10"
                    value={formData.feelsLikeScore}
                    onChange={handleChange}
                    className="score-slider"
                  />
                  <span className="score-value">{formData.feelsLikeScore}</span>
                </div>
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="note">Notiz</label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optionale Anmerkungen zum Training..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editId ? 'Änderungen speichern' : 'Training speichern'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trainingsliste */}
      <div className="training-list-card">
        {loading ? (
          <p className="loading-text">Trainings werden geladen...</p>
        ) : trainings.length === 0 ? (
          <div className="empty-state">
            <p>Du hast noch keine Trainingseinheiten erfasst.</p>
            <button
              className="btn-primary"
              onClick={() => { setShowForm(true); setEditId(null); setFormData({ ...LEERES_FORMULAR }); }}
            >
              Erstes Training erfassen
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="training-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Sportart</th>
                  <th>Dauer (Min)</th>
                  <th>Distanz (km)</th>
                  <th>Score</th>
                  <th>Notiz</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDatum(t.datum)}</td>
                    <td>
                      <span className="sportart-badge">
                        {sportartIcon(t.sportart)} {t.sportart}
                      </span>
                    </td>
                    <td>{t.dauer}</td>
                    <td>{t.distanz !== null ? t.distanz : '–'}</td>
                    <td>
                      <span className="score-badge">{t.feelsLikeScore}/10</span>
                    </td>
                    <td className="note-cell">{t.note || '–'}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(t)}
                        title="Bearbeiten"
                        aria-label="Training bearbeiten"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClick(t.id)}
                        title="Löschen"
                        aria-label="Training löschen"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lösch-Bestätigung */}
      {deleteConfirmId !== null && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>Training löschen?</h3>
            <p>Möchtest du diese Trainingseinheit wirklich unwiderruflich löschen?</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                Ja, löschen
              </button>
              <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
