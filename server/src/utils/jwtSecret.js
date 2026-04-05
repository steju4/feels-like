/*
  Liest das JWT-Secret zentral aus der Umgebung.
  Bricht bewusst hart ab, wenn der Wert fehlt.
*/

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_SECRET ist nicht gesetzt.');
    error.status = 500;
    throw error;
  }
  return secret;
}

module.exports = {
  getJwtSecret,
};
