/*
  TODO: Login Page
  
  Design-Vorlage: "Login-Formular" (siehe HTML Mockup).
  Funktionen:
  - Eingabefelder für E-Mail und Passwort.
  - "Login" Button -> ruft login() aus AuthContext auf.
  - Fehlermeldungen anzeigen (z.B. "Falsches Passwort").
  - Redirect nach erfolgreichem Login (Dashboard).
*/

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Login.css'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/'); // Nach Login zum Dashboard
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>FeelsLike Login</h2>
        {infoMessage && <div className="success-message">{infoMessage}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-btn">Einloggen</button>

          <div className="login-meta-link">
            <Link to="/passwort-vergessen">Passwort vergessen?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
