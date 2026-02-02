import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout'; // Groß-/Kleinschreibung beachten
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import TrainingForm from './pages/TrainingForm';
import Ranking from './pages/Ranking';
import AdminUsers from './pages/AdminUsers';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Öffentlicher Bereich */}
        <Route path="/login" element={<Login />} />

        {/* Geschützter Bereich (Layout mit Sidebar) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} /> 
          <Route path="training" element={<TrainingForm />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="admin" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;