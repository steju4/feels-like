/*
  Training Controller (TrainingsVerwaltung)
  
  Logik für das Verwalten von Trainingsdaten.
  
  Da die Routen hier mit `authMiddleware` geschützt werden hat man Zugriff auf req.user
  Beispiel Create:
  const athletId = req.user.id; // Aktuell eingeloggter User
  
  Funktionen:
  - trainingErfassen: Neues Training anlegen (POST) -> Eingaben validieren -> Score berechnen -> Speichern.
  - alleTrainings: Alle Trainings des eingeloggten Users holen (GET).
  - trainingAendern: Bestehendes Training bearbeiten (PUT).
  - trainingLoeschen: Training löschen (DELETE).
*/

exports.trainingErfassen = async (req, res) => {
  res.send('Training erfassen Logic');
};

exports.alleTrainings = async (req, res) => {
  res.send('Alle Trainings laden Logic');
};
