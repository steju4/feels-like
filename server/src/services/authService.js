const jwt = require('jsonwebtoken');
const Athlet = require('../models/Athlet');
const { getJwtSecret } = require('../utils/jwtSecret');

const MIN_PASSWORD_LENGTH = 8;

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

async function anmelden(email, password) {
  const user = await Athlet.findOne({ where: { email } });
  if (!user) {
    const error = new Error('E-Mail oder Passwort falsch');
    error.status = 401;
    throw error;
  }

  const isMatch = await user.checkPassword(password);
  if (!isMatch) {
    const error = new Error('E-Mail oder Passwort falsch');
    error.status = 401;
    throw error;
  }

  if (user.status !== 'aktiv') {
    const error = new Error('Konto ist nicht aktiv. Bitte kontaktiere den Trainer.');
    error.status = 403;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  return {
    token,
    user: sanitizeUser(user),
  };
}

async function registrierenMitEinladung({ token, name, password, passwordConfirm }) {
  const normalizedToken = String(token || '').trim();
  const normalizedName = String(name || '').trim();
  const normalizedPassword = String(password || '');

  if (!normalizedToken) {
    throw createHttpError(400, 'Einladungs-Token ist erforderlich.');
  }

  if (!normalizedName) {
    throw createHttpError(400, 'Name ist erforderlich.');
  }

  if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
    throw createHttpError(400, `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
  }

  if (passwordConfirm !== undefined && normalizedPassword !== String(passwordConfirm)) {
    throw createHttpError(400, 'Passwort und Passwort-Bestätigung stimmen nicht überein.');
  }

  let payload;
  try {
    payload = jwt.verify(normalizedToken, getJwtSecret());
  } catch {
    throw createHttpError(400, 'Ungültiger oder abgelaufener Einladungslink.');
  }

  if (payload?.type !== 'invitation' || !payload?.sub) {
    throw createHttpError(400, 'Ungültiger Einladungslink.');
  }

  const athletId = Number.parseInt(String(payload.sub), 10);
  if (Number.isNaN(athletId)) {
    throw createHttpError(400, 'Ungültiger Einladungslink.');
  }

  const athlet = await Athlet.findOne({
    where: {
      id: athletId,
      role: 'athlet',
    },
  });

  if (!athlet) {
    throw createHttpError(404, 'Einladung nicht gefunden.');
  }

  if (athlet.status !== 'eingeladen') {
    throw createHttpError(400, 'Einladung ist nicht mehr gültig.');
  }

  athlet.name = normalizedName;
  athlet.passwortHash = normalizedPassword;
  athlet.status = 'aktiv';
  await athlet.save();

  return { message: 'Registrierung erfolgreich. Du kannst dich jetzt einloggen.' };
}

module.exports = {
  anmelden,
  getJwtSecret,
  registrierenMitEinladung,
};
