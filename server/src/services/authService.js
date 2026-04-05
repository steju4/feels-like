const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Athlet = require('../models/Athlet');
const { getJwtSecret } = require('../utils/jwtSecret');
const { sendePasswortResetMail } = require('./emailService');

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const RESET_TOKEN_VALIDITY = process.env.PASSWORD_RESET_TOKEN_VALIDITY || '30m';

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

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildPasswordResetUrl(token) {
  const baseUrl = (process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${baseUrl}/passwort-reset?token=${encodeURIComponent(token)}`;
}

function createPasswordHashFingerprint(passwortHash) {
  return crypto
    .createHash('sha256')
    .update(String(passwortHash || ''))
    .digest('hex')
    .slice(0, 16);
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

async function passwortResetAnfordern({ email }) {
  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createHttpError(400, 'Bitte eine gültige E-Mail-Adresse angeben.');
  }

  const genericMessage = 'Wenn die E-Mail-Adresse registriert ist, wurde ein Passwort-Reset-Link versendet.';

  const user = await Athlet.findOne({ where: { email: normalizedEmail } });
  if (!user || user.status === 'eingeladen') {
    return { message: genericMessage };
  }

  const token = jwt.sign(
    {
      sub: String(user.id),
      type: 'password-reset',
      pfp: createPasswordHashFingerprint(user.passwortHash),
      nonce: crypto.randomBytes(16).toString('hex'),
    },
    getJwtSecret(),
    { expiresIn: RESET_TOKEN_VALIDITY }
  );

  const resetUrl = buildPasswordResetUrl(token);
  const mailResult = await sendePasswortResetMail({
    to: user.email,
    name: user.name,
    resetUrl,
  });

  return {
    message: genericMessage,
    deliveryMode: mailResult.mode,
    resetPreviewUrl: mailResult.previewUrl,
  };
}

async function passwortResetBestaetigen({ token, password, passwordConfirm }) {
  const normalizedToken = String(token || '').trim();
  const normalizedPassword = String(password || '');

  if (!normalizedToken) {
    throw createHttpError(400, 'Reset-Token ist erforderlich.');
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
    throw createHttpError(400, 'Ungültiger oder abgelaufener Reset-Link.');
  }

  if (payload?.type !== 'password-reset' || !payload?.sub || !payload?.pfp) {
    throw createHttpError(400, 'Ungültiger Reset-Link.');
  }

  const userId = Number.parseInt(String(payload.sub), 10);
  if (Number.isNaN(userId)) {
    throw createHttpError(400, 'Ungültiger Reset-Link.');
  }

  const user = await Athlet.findByPk(userId);
  if (!user || user.status === 'eingeladen') {
    throw createHttpError(400, 'Reset-Link ist nicht mehr gültig.');
  }

  const expectedFingerprint = createPasswordHashFingerprint(user.passwortHash);
  if (payload.pfp !== expectedFingerprint) {
    throw createHttpError(400, 'Reset-Link ist nicht mehr gültig oder wurde bereits verwendet.');
  }

  user.passwortHash = normalizedPassword;
  await user.save();

  return {
    message: 'Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt einloggen.',
  };
}

module.exports = {
  anmelden,
  getJwtSecret,
  registrierenMitEinladung,
  passwortResetAnfordern,
  passwortResetBestaetigen,
};
