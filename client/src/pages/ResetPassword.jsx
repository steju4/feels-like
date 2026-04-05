/*
  Setzt ein neues Passwort über einen Reset-Link.
  Token wird aus der URL gelesen und mit dem Formular abgeschickt.
*/

import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './ResetPassword.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = useMemo(() => {
    // Reset-Token aus Query-String
    const params = new URLSearchParams(location.search);
    return params.get('token') || '';
  }, [location.search]);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Der Reset-Link ist ungültig.');
      return;
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwort und Passwort-Bestätigung stimmen nicht überein.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/auth/password-reset/confirm', {
        token,
        password,
        passwordConfirm,
      });

      setSuccess(response.data?.message || 'Passwort wurde erfolgreich zurückgesetzt.');

      // Kurze Bestätigung anzeigen, dann zurück zum Login
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Passwort wurde zurückgesetzt. Bitte einloggen.' },
        });
      }, 1300);
    } catch (err) {
      setError(err.response?.data?.message || 'Passwort konnte nicht zurückgesetzt werden.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Neues Passwort setzen</h2>
        <p>Lege ein neues Passwort für dein Konto fest.</p>

        {!token && (
          <div className="reset-password-message reset-password-message-error">
            Kein gültiger Token gefunden. Bitte verwende den Link aus der E-Mail.
          </div>
        )}

        {error && <div className="reset-password-message reset-password-message-error">{error}</div>}
        {success && <div className="reset-password-message reset-password-message-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="reset-password-form-row">
            <label htmlFor="resetPassword">Neues Passwort (min. 8 Zeichen)</label>
            <input
              id="resetPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              disabled={submitting}
              required
            />
          </div>

          <div className="reset-password-form-row">
            <label htmlFor="resetPasswordConfirm">Passwort bestätigen</label>
            <input
              id="resetPasswordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              minLength={8}
              disabled={submitting}
              required
            />
          </div>

          <button type="submit" className="reset-password-btn" disabled={submitting || !token}>
            {submitting ? 'Speichere...' : 'Passwort zurücksetzen'}
          </button>
        </form>
      </div>
    </div>
  );
}
