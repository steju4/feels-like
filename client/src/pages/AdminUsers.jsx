/*
  TODO: Admin / User Management Page
  
  Nur für Trainer sichtbar.
  - Liste aller Athleten.
  - Button "Neuen Athleten einladen".
  - Status ändern (aktiv/inaktiv).
*/

import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import './AdminUsers.css';

export default function AdminUsers() {
  const { user } = useAuth();

  const [athleten, setAthleten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('');

  const isTrainer = useMemo(() => user?.role === 'trainer', [user]);

  const loadAthleten = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users');
      setAthleten(response.data || []);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError('Diese Seite ist nur fuer Trainer verfuegbar.');
      } else {
        setError(err.response?.data?.message || 'Athleten konnten nicht geladen werden.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTrainer) {
      loadAthleten();
    } else {
      setLoading(false);
    }
  }, [isTrainer]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPreviewUrl('');
    setDeliveryMode('');

    if (!inviteName.trim()) {
      setError('Bitte einen Namen eingeben.');
      return;
    }

    if (!inviteEmail.trim()) {
      setError('Bitte eine E-Mail-Adresse eingeben.');
      return;
    }

    setSubmittingInvite(true);
    try {
      const response = await api.post('/users', {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
      });

      setSuccess(response.data?.message || 'Athlet wurde eingeladen.');
      setPreviewUrl(response.data?.invitationPreviewUrl || '');
      setDeliveryMode(response.data?.deliveryMode || '');
      setInviteName('');
      setInviteEmail('');
      setShowInviteForm(false);
      await loadAthleten();
    } catch (err) {
      setError(err.response?.data?.message || 'Einladung konnte nicht gesendet werden.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleToggleStatus = async (athlet) => {
    const neuerStatus = athlet.status === 'aktiv' ? 'inaktiv' : 'aktiv';
    setStatusLoadingId(athlet.id);
    setError('');
    setSuccess('');

    try {
      await api.put(`/users/${athlet.id}/status`, { status: neuerStatus });
      setAthleten((prev) => prev.map((item) => (
        item.id === athlet.id
          ? { ...item, status: neuerStatus }
          : item
      )));
      setSuccess(`Status von ${athlet.name} wurde auf ${neuerStatus} gesetzt.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Status konnte nicht geaendert werden.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  if (!isTrainer) {
    return (
      <section className="admin-users-page">
        <h1>Athletenverwaltung</h1>
        <div className="admin-message admin-message-error">Keine Berechtigung fuer diese Seite.</div>
      </section>
    );
  }

  return (
    <section className="admin-users-page">
      <div className="admin-header">
        <div>
          <h1>Athletenverwaltung</h1>
          <p>Einladen, Status pruefen und Aktivitaet steuern.</p>
        </div>
        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => {
            setShowInviteForm((prev) => !prev);
            setError('');
            setSuccess('');
            setPreviewUrl('');
            setDeliveryMode('');
          }}
        >
          {showInviteForm ? 'Formular schliessen' : 'Neuen Athleten einladen'}
        </button>
      </div>

      {error && <div className="admin-message admin-message-error">{error}</div>}
      {success && <div className="admin-message admin-message-success">{success}</div>}
      {previewUrl && (
        <div className="admin-message admin-message-info">
          {deliveryMode === 'ethereal'
            ? 'Test-E-Mail Vorschau:'
            : deliveryMode === 'console'
              ? 'Lokaler Fallback-Link:'
              : 'Einladungslink:'}{' '}
          <a href={previewUrl} target="_blank" rel="noreferrer">{previewUrl}</a>
        </div>
      )}

      {showInviteForm && (
        <form className="admin-invite-form" onSubmit={handleInviteSubmit}>
          <div className="admin-form-row">
            <label htmlFor="inviteName">Name</label>
            <input
              id="inviteName"
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="z. B. Max Muster"
              required
            />
          </div>

          <div className="admin-form-row">
            <label htmlFor="inviteEmail">E-Mail</label>
            <input
              id="inviteEmail"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@beispiel.de"
              required
            />
          </div>

          <button type="submit" className="admin-primary-btn" disabled={submittingInvite}>
            {submittingInvite ? 'Sende Einladung...' : 'Athlet einladen'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="admin-loading">Lade Athleten...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Status</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {athleten.length === 0 && (
                <tr>
                  <td colSpan="4" className="admin-empty">Noch keine Athleten vorhanden.</td>
                </tr>
              )}

              {athleten.map((athlet) => (
                <tr key={athlet.id}>
                  <td>{athlet.name}</td>
                  <td>{athlet.email}</td>
                  <td>
                    <span className={`admin-status admin-status-${athlet.status}`}>
                      {athlet.status}
                    </span>
                  </td>
                  <td>
                    {athlet.status === 'eingeladen' ? (
                      <span className="admin-action-hint">Wartet auf Registrierung</span>
                    ) : (
                      <button
                        type="button"
                        className="admin-secondary-btn"
                        onClick={() => handleToggleStatus(athlet)}
                        disabled={statusLoadingId === athlet.id}
                      >
                        {statusLoadingId === athlet.id
                          ? 'Speichern...'
                          : athlet.status === 'aktiv'
                            ? 'Inaktiv setzen'
                            : 'Aktiv setzen'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
