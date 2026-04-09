/*
  Fachlogik für Profilpflege und Athletenverwaltung.
  Enthält Einladungsflow, Passwortwechsel und Statusregeln
*/

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Athlet = require('../models/Athlet');
const { getJwtSecret } = require('../utils/jwtSecret');
const { sendeEinladungsMail } = require('./emailService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MIN_PASSWORD_LENGTH = 8;
const INVITE_TOKEN_VALIDITY = '48h';
const ALLOWED_STATUS_VALUES = new Set(['aktiv', 'inaktiv']);

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeAthlet(athlet) {
  return {
    id: athlet.id,
    name: athlet.name,
    email: athlet.email,
    status: athlet.status,
    role: athlet.role,
    createdAt: athlet.createdAt,
    updatedAt: athlet.updatedAt,
  };
}

function buildRegisterUrl(token) {
  const baseUrl = (process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${baseUrl}/register?token=${encodeURIComponent(token)}`;
}

async function ladeProfil(userId) {
  const user = await Athlet.findByPk(userId, {
    attributes: { exclude: ['passwortHash'] },
  });

  if (!user) {
    throw createHttpError(404, 'User nicht gefunden');
  }

  return user;
}

async function aktualisiereProfil({ userId, name, email }) {
  const preparedName = String(name || '').trim();
  const preparedEmail = normalizeEmail(email);

  if (!preparedName) {
    throw createHttpError(400, 'Name ist erforderlich.');
  }

  if (!EMAIL_REGEX.test(preparedEmail)) {
    throw createHttpError(400, 'Bitte eine gültige E-Mail-Adresse angeben.');
  }

  const user = await Athlet.findByPk(userId);
  if (!user) {
    throw createHttpError(404, 'User nicht gefunden.');
  }

  if (user.email !== preparedEmail) {
    // E-Mail darf systemweit nur einmal vorkommen
    const existingUser = await Athlet.findOne({ where: { email: preparedEmail } });
    if (existingUser && existingUser.id !== user.id) {
      throw createHttpError(409, 'Diese E-Mail-Adresse ist bereits registriert.');
    }
  }

  user.name = preparedName;
  user.email = preparedEmail;
  await user.save();

  return sanitizeAthlet(user);
}

async function aendereEigenesPasswort({ userId, currentPassword, newPassword, newPasswordConfirm }) {
  const preparedCurrentPassword = String(currentPassword || '');
  const preparedNewPassword = String(newPassword || '');
  const preparedNewPasswordConfirm = String(newPasswordConfirm || '');

  if (!preparedCurrentPassword || !preparedNewPassword || !preparedNewPasswordConfirm) {
    throw createHttpError(400, 'Aktuelles Passwort, neues Passwort und Bestätigung sind erforderlich.');
  }

  if (preparedNewPassword.length < MIN_PASSWORD_LENGTH) {
    throw createHttpError(400, `Das neue Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
  }

  if (preparedNewPassword !== preparedNewPasswordConfirm) {
    throw createHttpError(400, 'Neues Passwort und Bestätigung stimmen nicht überein.');
  }

  if (preparedCurrentPassword === preparedNewPassword) {
    throw createHttpError(400, 'Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.');
  }

  const user = await Athlet.findByPk(userId);
  if (!user) {
    throw createHttpError(404, 'User nicht gefunden.');
  }

  const isCurrentPasswordValid = await user.checkPassword(preparedCurrentPassword);
  if (!isCurrentPasswordValid) {
    throw createHttpError(400, 'Aktuelles Passwort ist nicht korrekt.');
  }

  user.passwortHash = preparedNewPassword;
  await user.save();

  return { message: 'Passwort wurde erfolgreich geändert.' };
}

async function ladeAthletenListe() {
  const athleten = await Athlet.findAll({
    where: { role: 'athlet' },
    attributes: { exclude: ['passwortHash'] },
    order: [['createdAt', 'DESC']],
  });

  return athleten.map(sanitizeAthlet);
}

async function legeAthletAn({ name, email }) {
  const preparedName = String(name || '').trim();
  const preparedEmail = normalizeEmail(email);

  if (!preparedName) {
    throw createHttpError(400, 'Name ist erforderlich.');
  }

  if (!EMAIL_REGEX.test(preparedEmail)) {
    throw createHttpError(400, 'Bitte eine gültige E-Mail-Adresse angeben.');
  }

  const existingUser = await Athlet.findOne({ where: { email: preparedEmail } });
  if (existingUser) {
    throw createHttpError(409, 'Diese E-Mail-Adresse ist bereits registriert.');
  }

  const athlet = await Athlet.create({
    name: preparedName,
    email: preparedEmail,
    role: 'athlet',
    status: 'eingeladen',
    // Platzhalter-Passwort bis die Registrierung abgeschlossen wird.
    passwortHash: crypto.randomBytes(24).toString('hex'),
  });

  const invitationToken = jwt.sign(
    {
      sub: String(athlet.id),
      type: 'invitation',
      // Zufallskomponente, damit Links eindeutig bleiben
      nonce: crypto.randomBytes(16).toString('hex'),
    },
    getJwtSecret(),
    { expiresIn: INVITE_TOKEN_VALIDITY }
  );

  const registerUrl = buildRegisterUrl(invitationToken);
  const mailResult = await sendeEinladungsMail({
    to: athlet.email,
    name: athlet.name,
    registerUrl,
  });

  const messageByMode = {
    smtp: 'Athlet wurde angelegt und per E-Mail eingeladen.',
    ethereal: 'Athlet wurde angelegt. Einladung wurde als Test-E-Mail versendet.',
    console: 'Athlet wurde angelegt. Einladung wurde lokal bereitgestellt.',
  };

  return {
    message: messageByMode[mailResult.mode] || messageByMode.console,
    athlet: sanitizeAthlet(athlet),
    invitationPreviewUrl: mailResult.previewUrl,
    deliveryMode: mailResult.mode,
  };
}

async function aendereAthletStatus({ athletId, status }) {
  const parsedAthletId = Number.parseInt(String(athletId), 10);
  const normalizedStatus = String(status || '').trim().toLowerCase();

  if (Number.isNaN(parsedAthletId)) {
    throw createHttpError(400, 'Ungültige Athlet-ID.');
  }

  if (!ALLOWED_STATUS_VALUES.has(normalizedStatus)) {
    throw createHttpError(400, 'Status muss "aktiv" oder "inaktiv" sein.');
  }

  const athlet = await Athlet.findOne({
    where: {
      id: parsedAthletId,
      role: 'athlet',
    },
  });

  if (!athlet) {
    throw createHttpError(404, 'Athlet nicht gefunden.');
  }

  if (athlet.status === 'eingeladen') {
    // Eingeladene Konten werden erst über Registrierung aktiviert
    throw createHttpError(400, 'Status kann erst nach abgeschlossener Registrierung geändert werden.');
  }

  athlet.status = normalizedStatus;
  await athlet.save();

  return {
    message: `Status wurde auf "${normalizedStatus}" gesetzt.`,
    athlet: sanitizeAthlet(athlet),
  };
}

module.exports = {
  ladeProfil,
  aktualisiereProfil,
  aendereEigenesPasswort,
  ladeAthletenListe,
  legeAthletAn,
  aendereAthletStatus,
};
