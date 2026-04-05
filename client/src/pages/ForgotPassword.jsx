/*
  Startpunkt für den Passwort-Reset.
  Nimmt die E-Mail entgegen und fordert den Reset-Link beim Backend an.
*/

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Whitespace am Rand entfernen, um unnötige Fehlermeldungen zu vermeiden
    const preparedEmail = String(email || '').trim();
    if (!preparedEmail) {
      setError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/auth/password-reset/request', {
        email: preparedEmail,
      });

      setSuccess(
        response.data?.message
          || 'Wenn die E-Mail-Adresse registriert ist, wurde ein Passwort-Reset-Link versendet.'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Passwort-Reset konnte nicht angefordert werden.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Passwort vergessen</h2>
        <p>Gib deine registrierte E-Mail-Adresse ein. Wir senden dir einen Reset-Link.</p>

        {error && <div className="forgot-password-message forgot-password-message-error">{error}</div>}
        {success && <div className="forgot-password-message forgot-password-message-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="forgot-password-form-row">
            <label htmlFor="forgotPasswordEmail">E-Mail-Adresse</label>
            <input
              id="forgotPasswordEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button type="submit" className="forgot-password-btn" disabled={submitting}>
            {submitting ? 'Sende Link...' : 'Reset-Link anfordern'}
          </button>
        </form>

        <div className="forgot-password-back-link">
          <Link to="/login">Zurück zum Login</Link>
        </div>
      </div>
    </div>
  );
}
