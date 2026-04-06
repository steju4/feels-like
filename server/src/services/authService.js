const jwt = require('jsonwebtoken');
const Athlet = require('../models/Athlet');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_SECRET ist nicht gesetzt.');
    error.status = 500;
    throw error;
  }
  return secret;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
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

module.exports = {
  anmelden,
  getJwtSecret,
};
