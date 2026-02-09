import React from 'react';
import './Ranking.css'; // 

const Ranking = () => {
  // Mock-Daten anlegen
  const dummyData = [
    { id: 1, name: 'Max Mustermann', score: 1250, workouts: 15 },
    { id: 2, name: 'Julia Sportlich', score: 1100, workouts: 12 },
    { id: 3, name: 'Erika Musterfrau', score: 950, workouts: 10 },
    { id: 4, name: 'Kevin Power', score: 800, workouts: 8 },
    { id: 5, name: 'Sarah Ausdauer', score: 650, workouts: 7 },
  ];

  return (
    <div className="ranking-container">
      <h1>Bestenliste</h1>
      <p>Hier siehst du die aktuellen Top-Athleten von Feels Like.</p>

      {/*Tabellen-Struktur & Spalten */}
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Platzierung</th>
            <th>Benutzername</th>
            <th>Gesamt-Score</th>
            <th>Trainingsanzahl</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((user, index) => (
            <tr key={user.id}>
              {/* Platzierung ist Index + 1, da das Array bei 0 startet */}
              <td>{index + 1}.</td>
              <td><strong>{user.name}</strong></td>
              <td>{user.score} Pkt.</td>
              <td>{user.workouts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ranking;