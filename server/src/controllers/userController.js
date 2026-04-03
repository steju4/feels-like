/*
  User Controller (AthletenVerwaltung)

  HTTP-Schicht fuer Benutzerverwaltung.
  Fachlogik liegt im userService.
*/

const userService = require('../services/userService');

function handleControllerError(res, error, defaultMessage) {
  if (error?.status) {
    if (error.status >= 500) {
      console.error(error);
    }
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: defaultMessage });
}

exports.profilLaden = async (req, res) => {
  try {
    const user = await userService.ladeProfil(req.user.id);

    return res.json(user);
  } catch (error) {
    return handleControllerError(res, error, 'Fehler beim Laden des Profils');
  }
};

exports.athletenListe = async (req, res) => {
  try {
    const athleten = await userService.ladeAthletenListe();

    return res.json(athleten);
  } catch (error) {
    return handleControllerError(res, error, 'Fehler beim Laden der Athletenliste');
  }
};

exports.athletAnlegen = async (req, res) => {
  try {
    const result = await userService.legeAthletAn({
      name: req.body?.name,
      email: req.body?.email,
    });

    return res.status(201).json(result);
  } catch (error) {
    return handleControllerError(res, error, 'Fehler beim Anlegen des Athleten.');
  }
};

exports.athletStatusAendern = async (req, res) => {
  try {
    const result = await userService.aendereAthletStatus({
      athletId: req.params.id,
      status: req.body?.status,
    });

    return res.json(result);
  } catch (error) {
    return handleControllerError(res, error, 'Fehler beim Aendern des Status.');
  }
};
