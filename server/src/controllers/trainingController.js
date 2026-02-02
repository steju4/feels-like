/*
  TODO: Training Controller
  
  Logik für das Verwalten von Trainingsdaten.
  Funktionen:
  - create: Neues Training anlegen (POST) -> Eingaben validieren -> Score berechnen -> Speichern.
  - getAll: Alle Trainings des eingeloggten Users holen (GET).
  - getOne: Details zu einem Training (GET).
  - update: Bestehendes Training bearbeiten (PUT).
  - delete: Training löschen (DELETE).
*/

exports.createTraining = async (req, res) => {
  res.send('Create Training Logic');
};

exports.getAllTrainings = async (req, res) => {
  res.send('Get All Trainings Logic');
};
