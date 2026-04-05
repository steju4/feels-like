const requireRole = require('../../src/middleware/requireRole');

function createResponseMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireRole middleware', () => {
  test('returns 401 when req.user is missing', () => {
    const req = {};
    const res = createResponseMock();
    const next = jest.fn();

    requireRole('trainer')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nicht authentifiziert.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when role does not match', () => {
    const req = { user: { id: 1, role: 'athlet' } };
    const res = createResponseMock();
    const next = jest.fn();

    requireRole('trainer')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Keine Berechtigung für diese Aktion.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when role matches', () => {
    const req = { user: { id: 1, role: 'trainer' } };
    const res = createResponseMock();
    const next = jest.fn();

    requireRole('trainer')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
