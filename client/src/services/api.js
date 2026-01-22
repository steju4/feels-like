import axios from 'axios';

// Basis-Konfiguration für alle Anfragen
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Backend-Adresse
  headers: {
    'Content-Type': 'application/json',
  },
});

// Später: Token automatisch anhängen

export default api;
