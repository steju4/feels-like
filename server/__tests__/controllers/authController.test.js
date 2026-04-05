const authService = require('../../src/services/authService');
const authController = require('../../src/controllers/authController');

jest.mock('../../src/services/authService', () => ({
  anmelden: jest.fn(),
  registrierenMitEinladung: jest.fn(),
  passwortResetAnfordern: jest.fn(),
  passwortResetBestaetigen: jest.fn(),
}));

function createResponseMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  describe('anmelden', () => {
    test('returns 400 when email or password is missing', async () => {
      const req = { body: { email: '', password: '' } };
      const res = createResponseMock();

      await authController.anmelden(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'E-Mail und Passwort sind erforderlich' });
      expect(authService.anmelden).not.toHaveBeenCalled();
    });

    test('sets session cookie and returns user on success', async () => {
      const req = { body: { email: 'user@example.com', password: 'secret123' } };
      const res = createResponseMock();

      authService.anmelden.mockResolvedValue({
        token: 'jwt-token',
        user: { id: 1, name: 'Test User', email: 'user@example.com', role: 'athlet', status: 'aktiv' },
      });

      await authController.anmelden(req, res);

      expect(authService.anmelden).toHaveBeenCalledWith('user@example.com', 'secret123');
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          path: '/',
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erfolgreich eingeloggt',
        user: expect.objectContaining({ id: 1, email: 'user@example.com' }),
      });
    });

    test('returns service status and message on auth failure', async () => {
      const req = { body: { email: 'user@example.com', password: 'wrong' } };
      const res = createResponseMock();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('E-Mail oder Passwort falsch');
      error.status = 401;
      authService.anmelden.mockRejectedValue(error);

      await authController.anmelden(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'E-Mail oder Passwort falsch' });

      consoleSpy.mockRestore();
    });
  });

  describe('abmelden', () => {
    test('clears token cookie and returns success message', () => {
      const req = {};
      const res = createResponseMock();

      authController.abmelden(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          path: '/',
        })
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Erfolgreich ausgeloggt' });
    });
  });

  describe('passwortResetAnfordern', () => {
    test('forwards request body email and returns service result', async () => {
      const req = { body: { email: 'athlet@example.com' } };
      const res = createResponseMock();

      authService.passwortResetAnfordern.mockResolvedValue({
        message: 'Wenn die E-Mail-Adresse registriert ist, wurde ein Passwort-Reset-Link versendet.',
      });

      await authController.passwortResetAnfordern(req, res);

      expect(authService.passwortResetAnfordern).toHaveBeenCalledWith({ email: 'athlet@example.com' });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });

    test('returns mapped 400 error from service', async () => {
      const req = { body: { email: 'invalid' } };
      const res = createResponseMock();

      const error = new Error('Bitte eine gueltige E-Mail-Adresse angeben.');
      error.status = 400;
      authService.passwortResetAnfordern.mockRejectedValue(error);

      await authController.passwortResetAnfordern(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Bitte eine gueltige E-Mail-Adresse angeben.' });
    });
  });

  describe('passwortResetBestaetigen', () => {
    test('forwards token and passwords and returns success result', async () => {
      const req = {
        body: {
          token: 'reset-token',
          password: 'newPassword123',
          passwordConfirm: 'newPassword123',
        },
      };
      const res = createResponseMock();

      authService.passwortResetBestaetigen.mockResolvedValue({
        message: 'Passwort wurde erfolgreich zurueckgesetzt. Du kannst dich jetzt einloggen.',
      });

      await authController.passwortResetBestaetigen(req, res);

      expect(authService.passwortResetBestaetigen).toHaveBeenCalledWith({
        token: 'reset-token',
        password: 'newPassword123',
        passwordConfirm: 'newPassword123',
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });

    test('returns 500 with default message on unexpected error', async () => {
      const req = { body: { token: 't', password: 'p', passwordConfirm: 'p' } };
      const res = createResponseMock();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      authService.passwortResetBestaetigen.mockRejectedValue(new Error('boom'));

      await authController.passwortResetBestaetigen(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Serverfehler beim Zurücksetzen des Passworts.',
      });

      consoleSpy.mockRestore();
    });
  });
});
