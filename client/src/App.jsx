import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import TrainingForm from './pages/TrainingForm';
import Ranking from './pages/Ranking';
import AdminUsers from './pages/AdminUsers';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Öffentlicher Bereich */}
          <Route path="/login" element={<Login />} />

          {/* Geschützter Bereich */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} /> 
              <Route path="training" element={<TrainingForm />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="admin" element={<AdminUsers />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;