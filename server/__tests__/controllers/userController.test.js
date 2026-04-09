/*
  Tests für userController.
  Prüft Mapping von Requestdaten, Service-Aufrufe und Fehlerweitergabe.
*/

const userService = require('../../src/services/userService');
const userController = require('../../src/controllers/userController');

jest.mock('../../src/services/userService', () => ({
  ladeProfil: jest.fn(),
  aktualisiereProfil: jest.fn(),
  aendereEigenesPasswort: jest.fn(),
  ladeAthletenListe: jest.fn(),
  legeAthletAn: jest.fn(),
  aendereAthletStatus: jest.fn(),
}));

function createResponseMock() {
  // Response-Mock
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('profilLaden', () => {
    test('returns profile from service', async () => {
      const req = { user: { id: 7 } };
      const res = createResponseMock();

      userService.ladeProfil.mockResolvedValue({ id: 7, name: 'Max', email: 'max@example.com' });

      await userController.profilLaden(req, res);

      expect(userService.ladeProfil).toHaveBeenCalledWith(7);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
    });

    test('maps service status errors', async () => {
      const req = { user: { id: 99 } };
      const res = createResponseMock();

      const error = new Error('User nicht gefunden');
      error.status = 404;
      userService.ladeProfil.mockRejectedValue(error);

      await userController.profilLaden(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User nicht gefunden' });
    });
  });

  describe('profilAktualisieren', () => {
    test('forwards payload and returns success envelope', async () => {
      const req = {
        user: { id: 8 },
        body: { name: 'Mia', email: 'mia@example.com' },
      };
      const res = createResponseMock();

      userService.aktualisiereProfil.mockResolvedValue({
        id: 8,
        name: 'Mia',
        email: 'mia@example.com',
      });

      await userController.profilAktualisieren(req, res);

      expect(userService.aktualisiereProfil).toHaveBeenCalledWith({
        userId: 8,
        name: 'Mia',
        email: 'mia@example.com',
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profil wurde erfolgreich aktualisiert.',
        user: expect.objectContaining({ id: 8, email: 'mia@example.com' }),
      });
    });

    test('returns default 500 response on unexpected error', async () => {
      const req = { user: { id: 8 }, body: { name: 'Mia', email: 'mia@example.com' } };
      const res = createResponseMock();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      userService.aktualisiereProfil.mockRejectedValue(new Error('boom'));

      await userController.profilAktualisieren(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Fehler beim Aktualisieren des Profils.' });

      consoleSpy.mockRestore();
    });
  });

  describe('eigenesPasswortAendern', () => {
    test('forwards password payload and returns service result', async () => {
      const req = {
        user: { id: 3 },
        body: {
          currentPassword: 'oldPass123',
          newPassword: 'newPass123',
          newPasswordConfirm: 'newPass123',
        },
      };
      const res = createResponseMock();

      userService.aendereEigenesPasswort.mockResolvedValue({
        message: 'Passwort wurde erfolgreich geändert.',
      });

      await userController.eigenesPasswortAendern(req, res);

      expect(userService.aendereEigenesPasswort).toHaveBeenCalledWith({
        userId: 3,
        currentPassword: 'oldPass123',
        newPassword: 'newPass123',
        newPasswordConfirm: 'newPass123',
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
  });

  describe('athletenListe', () => {
    test('returns athletes list from service', async () => {
      const req = {};
      const res = createResponseMock();

      userService.ladeAthletenListe.mockResolvedValue([
        { id: 1, name: 'A', email: 'a@example.com' },
        { id: 2, name: 'B', email: 'b@example.com' },
      ]);

      await userController.athletenListe(req, res);

      expect(userService.ladeAthletenListe).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('athletAnlegen', () => {
    test('returns 201 and service result', async () => {
      const req = { body: { name: 'New Athlet', email: 'new@example.com' } };
      const res = createResponseMock();

      userService.legeAthletAn.mockResolvedValue({
        message: 'Athlet wurde angelegt.',
        athlet: { id: 4, name: 'New Athlet', email: 'new@example.com' },
      });

      await userController.athletAnlegen(req, res);

      expect(userService.legeAthletAn).toHaveBeenCalledWith({
        name: 'New Athlet',
        email: 'new@example.com',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ athlet: expect.any(Object) }));
    });
  });

  describe('athletStatusAendern', () => {
    test('forwards route id and status', async () => {
      const req = {
        params: { id: '12' },
        body: { status: 'aktiv' },
      };
      const res = createResponseMock();

      userService.aendereAthletStatus.mockResolvedValue({
        message: 'Status wurde gesetzt.',
        athlet: { id: 12, status: 'aktiv' },
      });

      await userController.athletStatusAendern(req, res);

      expect(userService.aendereAthletStatus).toHaveBeenCalledWith({
        athletId: '12',
        status: 'aktiv',
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ athlet: expect.any(Object) }));
    });
  });
});
