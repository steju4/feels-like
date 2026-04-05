/*
  E-Mail Service

  Versandmodi:
  - smtp: echte Zustellung über konfigurierten SMTP-Server
  - ethereal: echte Test-Mail über Ethereal (inkl. Preview-Link)
  - console: lokaler Fallback (nur Konsole)
  - auto: smtp falls konfiguriert, sonst ethereal, sonst console
*/

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

const TOKEN_VALIDITY_HOURS = 48;
const RESET_TOKEN_VALIDITY_MINUTES = Number(process.env.PASSWORD_RESET_TOKEN_VALIDITY_MINUTES || 30);

const SUPPORTED_MAIL_MODES = new Set(['auto', 'smtp', 'ethereal', 'console']);

let cachedSmtpTransporter = null;
let cachedEtherealTransporter = null;

function getMailMode() {
  return String(process.env.MAIL_MODE || 'auto').trim().toLowerCase();
}

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST
      && process.env.SMTP_PORT
      && process.env.SMTP_USER
      && process.env.SMTP_PASS
  );
}

function getSmtpTransporter() {
  if (!nodemailer || !isSmtpConfigured()) {
    return null;
  }

  if (!cachedSmtpTransporter) {
    cachedSmtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return cachedSmtpTransporter;
}

async function getEtherealTransporter() {
  if (!nodemailer) {
    return null;
  }

  if (!cachedEtherealTransporter) {
    const account = await nodemailer.createTestAccount();
    cachedEtherealTransporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }

  return cachedEtherealTransporter;
}

function getFromAddress() {
  return process.env.SMTP_FROM || 'no-reply@feels-like.local';
}

async function sendeEinladungsMail({ to, name, registerUrl }) {
  const mailMode = getMailMode();

  if (!SUPPORTED_MAIL_MODES.has(mailMode)) {
    throw new Error('MAIL_MODE ist ungültig. Erlaubt sind: auto, smtp, ethereal, console.');
  }

  const subject = 'Einladung zur Feels Like Plattform';
  const text = [
    `Hallo ${name},`,
    '',
    'du wurdest eingeladen, dich auf der Feels Like Plattform zu registrieren.',
    `Der Link ist ${TOKEN_VALIDITY_HOURS} Stunden gültig:`,
    registerUrl,
    '',
    'Falls du diese Einladung nicht erwartet hast, kannst du diese Nachricht ignorieren.',
  ].join('\n');

  const html = [
    `<p>Hallo ${name},</p>`,
    '<p>du wurdest eingeladen, dich auf der Feels Like Plattform zu registrieren.</p>',
    `<p>Der Link ist <strong>${TOKEN_VALIDITY_HOURS} Stunden</strong> gültig:</p>`,
    `<p><a href="${registerUrl}">${registerUrl}</a></p>`,
    '<p>Falls du diese Einladung nicht erwartet hast, kannst du diese Nachricht ignorieren.</p>',
  ].join('');

  const mailOptions = {
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  };

  if (mailMode === 'smtp' || (mailMode === 'auto' && isSmtpConfigured())) {
    const transporter = getSmtpTransporter();
    if (!transporter) {
      throw new Error('SMTP ist nicht vollständig konfiguriert.');
    }

    await transporter.sendMail(mailOptions);
    return { mode: 'smtp' };
  }

  if (mailMode === 'ethereal' || (mailMode === 'auto' && !isSmtpConfigured())) {
    try {
      const transporter = await getEtherealTransporter();
      if (!transporter) {
        throw new Error('nodemailer ist nicht verfügbar.');
      }

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      return { mode: 'ethereal', previewUrl };
    } catch (error) {
      if (mailMode === 'ethereal') {
        throw error;
      }

      console.warn('[INVITATION_FALLBACK] Ethereal nicht verfügbar, wechsle auf Konsolen-Fallback.');
      console.warn(error.message);
    }
  }

  console.log('[INVITATION_CONSOLE_FALLBACK]');
  console.log(`An: ${to}`);
  console.log(`Link (gültig ${TOKEN_VALIDITY_HOURS}h): ${registerUrl}`);
  return {
    mode: 'console',
    previewUrl: registerUrl,
  };
}

async function sendePasswortResetMail({ to, name, resetUrl }) {
  const mailMode = getMailMode();

  if (!SUPPORTED_MAIL_MODES.has(mailMode)) {
    throw new Error('MAIL_MODE ist ungültig. Erlaubt sind: auto, smtp, ethereal, console.');
  }

  const subject = 'Passwort zurücksetzen - Feels Like Plattform';
  const text = [
    `Hallo ${name},`,
    '',
    'du hast das Zurücksetzen deines Passworts angefordert.',
    `Der Link ist etwa ${RESET_TOKEN_VALIDITY_MINUTES} Minuten gültig und einmalig nutzbar:`,
    resetUrl,
    '',
    'Falls du diese Anfrage nicht gestellt hast, kannst du diese Nachricht ignorieren.',
  ].join('\n');

  const html = [
    `<p>Hallo ${name},</p>`,
    '<p>du hast das Zurücksetzen deines Passworts angefordert.</p>',
    `<p>Der Link ist etwa <strong>${RESET_TOKEN_VALIDITY_MINUTES} Minuten</strong> gültig und einmalig nutzbar:</p>`,
    `<p><a href="${resetUrl}">${resetUrl}</a></p>`,
    '<p>Falls du diese Anfrage nicht gestellt hast, kannst du diese Nachricht ignorieren.</p>',
  ].join('');

  const mailOptions = {
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  };

  if (mailMode === 'smtp' || (mailMode === 'auto' && isSmtpConfigured())) {
    const transporter = getSmtpTransporter();
    if (!transporter) {
      throw new Error('SMTP ist nicht vollständig konfiguriert.');
    }

    await transporter.sendMail(mailOptions);
    return { mode: 'smtp' };
  }

  if (mailMode === 'ethereal' || (mailMode === 'auto' && !isSmtpConfigured())) {
    try {
      const transporter = await getEtherealTransporter();
      if (!transporter) {
        throw new Error('nodemailer ist nicht verfügbar.');
      }

      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      return { mode: 'ethereal', previewUrl };
    } catch (error) {
      if (mailMode === 'ethereal') {
        throw error;
      }

      console.warn('[PASSWORD_RESET_FALLBACK] Ethereal nicht verfügbar, wechsle auf Konsolen-Fallback.');
      console.warn(error.message);
    }
  }

  console.log('[PASSWORD_RESET_CONSOLE_FALLBACK]');
  console.log(`An: ${to}`);
  console.log(`Link (ca. ${RESET_TOKEN_VALIDITY_MINUTES}m gültig): ${resetUrl}`);
  return {
    mode: 'console',
    previewUrl: resetUrl,
  };
}

module.exports = {
  sendeEinladungsMail,
  sendePasswortResetMail,
};
