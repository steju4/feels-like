/*
  TODO: Auth Context
  
  React Context für globales State-Management des Users.
  Aufgaben:
  - State halten: { user: null, token: null, isAuthenticated: false }
  - login(email, password) Funktion bereitstellen -> API Call -> State setzen.
  - logout() Funktion -> State leeren.
  - Beim App-Start prüfen, ob Token noch gültig ist (useEffect).
*/
import { createContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Implementation
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
