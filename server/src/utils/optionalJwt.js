const crypto = require('crypto');

// Versucht jsonwebtoken zu laden; fällt andernfalls auf einfache HMAC-Variante zurück.
let jwtLib;
try {
  jwtLib = require('jsonwebtoken'); // bevorzugt, wenn installiert
} catch (err) {
  jwtLib = null;
}

const base64url = (input) =>
  Buffer.from(input).toString('base64url');

function fallbackSign(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(payload));
  const data = `${headerPart}.${payloadPart}`;
  const signature = crypto
    .createHmac('sha256', secret || 'dev-secret')
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

function fallbackVerify(token, secret) {
  const [headerPart, payloadPart, signature] = token.split('.');
  if (!headerPart || !payloadPart || !signature) {
    throw new Error('Invalid token');
  }
  const data = `${headerPart}.${payloadPart}`;
  const expected = crypto
    .createHmac('sha256', secret || 'dev-secret')
    .update(data)
    .digest('base64url');
  if (expected !== signature) {
    throw new Error('Signature mismatch');
  }
  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  return payload;
}

module.exports = {
  sign: (...args) => (jwtLib ? jwtLib.sign(...args) : fallbackSign(...args)),
  verify: (...args) => (jwtLib ? jwtLib.verify(...args) : fallbackVerify(...args)),
  usingFallback: !jwtLib,
};
