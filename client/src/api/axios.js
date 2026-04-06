/*
  TODO: Axios Instance
  
  Zentrale Konfiguration für API-Aufrufe.
  - BaseURL setzen (z.B. http://localhost:3000/api)
  - Interceptors hinzufügen, um den JWT-Token aus dem Context/LocalStorage automatisch an jeden Request anzuhängen.
*/

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // Cookies mitsenden erlauben
});

export default api;
