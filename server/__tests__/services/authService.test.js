const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mockFindOne = jest.fn();
const mockFindByPk = jest.fn();
const mockSendePasswortResetMail = jest.fn();

jest.mock('../../src/models/Athlet', () => ({
  findOne: mockFindOne,
  findByPk: mockFindByPk,
}));

jest.mock('../../src/services/emailService', () => ({
  sendePasswortResetMail: mockSendePasswortResetMail,
}));

const {
  passwortResetAnfordern,
  passwortResetBestaetigen,
} = require('../../src/services/authService');

function createFingerprint(passwortHash) {
  return crypto.createHash('sha256').update(String(passwortHash || '')).digest('hex').slice(0, 16);
}

describe('authService - Passwort-Reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'unit-test-secret';
    process.env.APP_BASE_URL = 'http://localhost:5173';
    process.env.PASSWORD_RESET_TOKEN_VALIDITY = '30m';
  });

  test('passwortResetAnfordern lehnt ungültige E-Mail ab', async () => {
    await expect(passwortResetAnfordern({ email: 'ungueltig' }))
      .rejects
      .toMatchObject({ status: 400 });

    expect(mockFindOne).not.toHaveBeenCalled();
    expect(mockSendePasswortResetMail).not.toHaveBeenCalled();
  });

  test('passwortResetAnfordern liefert generische Antwort für unbekannte E-Mail', async () => {
    mockFindOne.mockResolvedValue(null);

    const result = await passwortResetAnfordern({ email: 'unknown@example.com' });

    expect(result.message).toContain('Wenn die E-Mail-Adresse registriert ist');
    expect(mockSendePasswortResetMail).not.toHaveBeenCalled();
  });

  test('passwortResetAnfordern versendet Reset-Mail für registrierten Benutzer', async () => {
    mockFindOne.mockResolvedValue({
      id: 42,
      name: 'Test Athlet',
      email: 'athlet@example.com',
      status: 'aktiv',
      passwortHash: 'hash-before-reset',
    });

    mockSendePasswortResetMail.mockResolvedValue({
      mode: 'ethereal',
      previewUrl: 'https://ethereal.email/message/abc',
    });

    const result = await passwortResetAnfordern({ email: 'ATHLET@EXAMPLE.COM' });

    expect(mockSendePasswortResetMail).toHaveBeenCalledTimes(1);
    const args = mockSendePasswortResetMail.mock.calls[0][0];

    expect(args.to).toBe('athlet@example.com');
    expect(args.name).toBe('Test Athlet');
    expect(args.resetUrl).toContain('/passwort-reset?token=');

    const token = decodeURIComponent(args.resetUrl.split('token=')[1]);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    expect(payload.type).toBe('password-reset');
    expect(payload.sub).toBe('42');
    expect(payload.pfp).toBe(createFingerprint('hash-before-reset'));

    expect(result.deliveryMode).toBe('ethereal');
    expect(result.resetPreviewUrl).toBe('https://ethereal.email/message/abc');
  });

  test('passwortResetBestaetigen lehnt ungültigen Token ab', async () => {
    await expect(passwortResetBestaetigen({
      token: 'invalid-token',
      password: 'newPassword123',
      passwordConfirm: 'newPassword123',
    })).rejects.toMatchObject({ status: 400 });

    expect(mockFindByPk).not.toHaveBeenCalled();
  });

  test('passwortResetBestaetigen aktualisiert Passwort bei gültigem Token', async () => {
    const user = {
      id: 7,
      status: 'aktiv',
      passwortHash: 'old-password-hash',
      save: jest.fn().mockResolvedValue(true),
    };

    mockFindByPk.mockResolvedValue(user);

    const token = jwt.sign(
      {
        sub: String(user.id),
        type: 'password-reset',
        pfp: createFingerprint(user.passwortHash),
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const result = await passwortResetBestaetigen({
      token,
      password: 'newPassword123',
      passwordConfirm: 'newPassword123',
    });

    expect(user.passwortHash).toBe('newPassword123');
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result.message).toContain('erfolgreich zurückgesetzt');
  });

  test('passwortResetBestaetigen macht Link nach Nutzung ungültig', async () => {
    const user = {
      id: 8,
      status: 'aktiv',
      passwortHash: 'old-password-hash',
      save: jest.fn().mockImplementation(async () => true),
    };

    mockFindByPk.mockResolvedValue(user);

    const token = jwt.sign(
      {
        sub: String(user.id),
        type: 'password-reset',
        pfp: createFingerprint(user.passwortHash),
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    await passwortResetBestaetigen({
      token,
      password: 'newPassword123',
      passwordConfirm: 'newPassword123',
    });

    await expect(passwortResetBestaetigen({
      token,
      password: 'anotherPassword123',
      passwordConfirm: 'anotherPassword123',
    })).rejects.toMatchObject({ status: 400 });
  });
});
