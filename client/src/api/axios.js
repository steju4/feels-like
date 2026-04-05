/*
  Zentrale Axios-Instanz für alle API-Aufrufe im Client.
  Hält Basis-URL und Credential-Verhalten an einer Stelle.
*/

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // Cookies mitsenden erlauben
});

export default api;
