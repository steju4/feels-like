import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token') || '';
  }, [location.search]);

  const [name, setName] = useState('');
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
      setError('Der Einladungslink ist ungueltig.');
      return;
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwort und Passwort-Bestaetigung stimmen nicht ueberein.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/auth/register', {
        token,
        name,
        password,
        passwordConfirm,
      });

      setSuccess(response.data?.message || 'Registrierung erfolgreich.');

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Registrierung erfolgreich. Bitte einloggen.' },
        });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrierung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Athlet Registrierung</h2>
        <p>Vervollstaendige dein Konto ueber den Einladungslink.</p>

        {!token && (
          <div className="register-message register-message-error">
            Kein gueltiger Token gefunden. Bitte verwende den Link aus der Einladung.
          </div>
        )}

        {error && <div className="register-message register-message-error">{error}</div>}
        {success && <div className="register-message register-message-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="register-form-row">
            <label htmlFor="registerName">Name</label>
            <input
              id="registerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="register-form-row">
            <label htmlFor="registerPassword">Passwort (min. 8 Zeichen)</label>
            <input
              id="registerPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              disabled={submitting}
              required
            />
          </div>

          <div className="register-form-row">
            <label htmlFor="registerPasswordConfirm">Passwort bestaetigen</label>
            <input
              id="registerPasswordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              minLength={8}
              disabled={submitting}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={submitting || !token}>
            {submitting ? 'Registriere...' : 'Registrierung abschliessen'}
          </button>
        </form>
      </div>
    </div>
  );
}
