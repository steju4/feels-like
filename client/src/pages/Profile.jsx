import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import './Profile.css';

const MIN_PASSWORD_LENGTH = 8;

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user?.name, user?.email]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const preparedName = name.trim();
    const preparedEmail = email.trim();

    if (!preparedName) {
      setProfileError('Name ist erforderlich.');
      return;
    }

    if (!preparedEmail) {
      setProfileError('E-Mail ist erforderlich.');
      return;
    }

    setProfileSubmitting(true);
    try {
      const response = await api.put('/users/me', {
        name: preparedName,
        email: preparedEmail,
      });

      setProfileSuccess(response.data?.message || 'Profil wurde erfolgreich aktualisiert.');

      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Profil konnte nicht aktualisiert werden.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPasswordError('Bitte alle Passwort-Felder ausfüllen.');
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Das neue Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Neues Passwort und Bestätigung stimmen nicht überein.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const response = await api.put('/users/me/password', {
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });

      setPasswordSuccess(response.data?.message || 'Passwort wurde erfolgreich geändert.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Passwort konnte nicht geändert werden.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <section className="profile-page">
      <header className="profile-hero">
        <p className="profile-overline">Kontoverwaltung</p>
        <h1>Profil und Sicherheit</h1>
        <p>Persönliche Daten aktualisieren und Passwort sicher ändern.</p>
      </header>

      <section className="profile-meta-cards">
        <article className="profile-meta-card">
          <p className="profile-meta-label">Rolle</p>
          <p className="profile-meta-value">{user?.role?.toUpperCase() || '-'}</p>
        </article>
        <article className="profile-meta-card">
          <p className="profile-meta-label">Status</p>
          <p className="profile-meta-value">{user?.status || '-'}</p>
        </article>
      </section>

      <section className="profile-card">
        <h2>Profil bearbeiten</h2>

        {profileError && <div className="profile-alert profile-alert-error">{profileError}</div>}
        {profileSuccess && <div className="profile-alert profile-alert-success">{profileSuccess}</div>}

        <form className="profile-form" onSubmit={handleProfileSubmit}>
          <div className="profile-form-row">
            <label htmlFor="profileName">Name</label>
            <input
              id="profileName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={profileSubmitting}
              required
            />
          </div>

          <div className="profile-form-row">
            <label htmlFor="profileEmail">E-Mail</label>
            <input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={profileSubmitting}
              required
            />
          </div>

          <button type="submit" className="profile-btn-primary" disabled={profileSubmitting}>
            {profileSubmitting ? 'Speichere...' : 'Profil speichern'}
          </button>
        </form>
      </section>

      <section className="profile-card">
        <h2>Passwort ändern</h2>

        {passwordError && <div className="profile-alert profile-alert-error">{passwordError}</div>}
        {passwordSuccess && <div className="profile-alert profile-alert-success">{passwordSuccess}</div>}

        <form className="profile-form" onSubmit={handlePasswordSubmit}>
          <div className="profile-form-row">
            <label htmlFor="currentPassword">Aktuelles Passwort</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={passwordSubmitting}
              required
            />
          </div>

          <div className="profile-form-row">
            <label htmlFor="newPassword">Neues Passwort (min. 8 Zeichen)</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              disabled={passwordSubmitting}
              required
            />
          </div>

          <div className="profile-form-row">
            <label htmlFor="newPasswordConfirm">Neues Passwort bestätigen</label>
            <input
              id="newPasswordConfirm"
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              disabled={passwordSubmitting}
              required
            />
          </div>

          <button type="submit" className="profile-btn-primary" disabled={passwordSubmitting}>
            {passwordSubmitting ? 'Ändere...' : 'Passwort ändern'}
          </button>
        </form>
      </section>
    </section>
  );
}
