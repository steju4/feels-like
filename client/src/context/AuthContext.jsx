/*
  Stellt Auth-Zustand global bereit.
  Kümmert sich um Session-Check, Login, Logout und User-Refresh.
*/
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { AuthContext } from './authContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const response = await api.get('/users/me');
    setUser(response.data);
    return response.data;
  };

  // App-Start: Prüfen ob Session gültig ist (API Call mit Cookie)
  // Call an users/me automatisch beim Laden der Seite
  // Bei Erfolg: User steht im State zur Verfügung: `user.id`, `user.name` usw.
  useEffect(() => {
    api.get('/users/me')
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        // Wenn Session ungültig ist -> User auf null zurücksetzen
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user } = response.data;

      // Token wird automatisch als HttpOnly Cookie gesetzt
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login fehlgeschlagen' 
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout'); // Server muss Cookie löschen
    } catch (e) {
      console.error(e);
    } finally {
      // Local State leeren
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
