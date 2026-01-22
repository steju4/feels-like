import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Dashboard from './components/Dashboard'; // Import Dashboard
import './App.css'; // Dein altes CSS

// Platzhalter
const TrainingDummy = () => <div style={{padding:'20px'}}><h2>Hier kommen deine Trainings hin 🏋️‍♂️</h2></div>;
const RankingDummy = () => <div style={{padding:'20px'}}><h2>Wer ist der Beste? 🏆</h2></div>;
const LoginDummy = () => <div style={{padding:'20px'}}><h2>Bitte einloggen 🔐</h2></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Öffentlicher Bereich (Login) */}
        <Route path="/login" element={<LoginDummy />} />

        {/* Geschützter Bereich (Layout mit Sidebar) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* Startseite - Modernes Dashboard */}
          <Route path="training" element={<TrainingDummy />} />
          <Route path="ranking" element={<RankingDummy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;