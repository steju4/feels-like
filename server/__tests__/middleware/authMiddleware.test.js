/*
  Tests für authMiddleware.
  Deckt Token-Quellen, Fehlerpfade und Cookie-Handling ab.
*/

const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../src/utils/jwtSecret');
const authMiddleware = require('../../src/middleware/authMiddleware');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../../src/utils/jwtSecret', () => ({
  getJwtSecret: jest.fn(),
}));

function createResponseMock() {
  // Express-Response-Mock inkl. clearCookie für Fehlerpfade
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  test('returns 401 when no token is provided', () => {
    const req = { headers: {}, cookies: {} };
    const res = createResponseMock();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Zugriff verweigert.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('uses bearer header token before cookie token', () => {
    const req = {
      headers: { authorization: 'Bearer header-token' },
      cookies: { token: 'cookie-token' },
    };
    const res = createResponseMock();
    const next = jest.fn();

    getJwtSecret.mockReturnValue('jwt-secret');
    jwt.verify.mockReturnValue({ id: 2, role: 'trainer' });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('header-token', 'jwt-secret');
    expect(req.user).toEqual({ id: 2, role: 'trainer' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('uses cookie token when bearer header is absent', () => {
    const req = {
      headers: {},
      cookies: { token: 'cookie-token' },
    };
    const res = createResponseMock();
    const next = jest.fn();

    getJwtSecret.mockReturnValue('jwt-secret');
    jwt.verify.mockReturnValue({ id: 4, role: 'athlet' });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('cookie-token', 'jwt-secret');
    expect(req.user).toEqual({ id: 4, role: 'athlet' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('clears cookie and returns 401 when token is invalid', () => {
    const req = {
      headers: {},
      cookies: { token: 'invalid-token' },
    };
    const res = createResponseMock();
    const next = jest.fn();

    getJwtSecret.mockReturnValue('jwt-secret');
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    authMiddleware(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
      })
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token ungültig oder abgelaufen.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 500 when jwt secret configuration fails', () => {
    const req = {
      headers: { authorization: 'Bearer any-token' },
      cookies: {},
    };
    const res = createResponseMock();
    const next = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const configError = new Error('missing JWT_SECRET');
    configError.status = 500;
    getJwtSecret.mockImplementation(() => {
      throw configError;
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Serverkonfiguration unvollständig.',
    });
    expect(res.clearCookie).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
