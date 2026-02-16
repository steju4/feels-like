/*
  TODO: Auth Context
  
  React Context für globales State-Management des Users.
  Aufgaben:
  - State halten: { user: null, token: null, isAuthenticated: false }
  - login(email, password) Funktion bereitstellen -> API Call -> State setzen.
  - logout() Funktion -> State leeren.
  - Beim App-Start prüfen, ob Token noch gültig ist (useEffect).
*/
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    try {
      await api.post('/auth/logout'); // Server muss Cookie löschen
    } catch (e) {
      console.error(e);
    }
    // Local State leeren
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
