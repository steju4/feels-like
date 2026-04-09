import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TrainingForm from './pages/TrainingForm';
import Ranking from './pages/Ranking';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import './App.css';

// Zentrale Routenstruktur der App
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Öffentlicher Bereich */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/passwort-vergessen" element={<ForgotPassword />} />
          <Route path="/passwort-reset" element={<ResetPassword />} />

          {/* Geschützter Bereich */}
          <Route element={<ProtectedRoute />}>
            {/* Layout bleibt gleich, nur Outlet-Seite wechselt */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} /> 
              <Route path="training" element={<TrainingForm />} />
              <Route
                path="ranking"
                element={(
                  <ProtectedRoute requiredRole="trainer">
                    <Ranking />
                  </ProtectedRoute>
                )}
              />
              <Route path="profil" element={<Profile />} />
              <Route
                path="admin"
                element={(
                  <ProtectedRoute requiredRole="trainer">
                    <AdminUsers />
                  </ProtectedRoute>
                )}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;