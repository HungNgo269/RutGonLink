import { PasswordHashService } from './password-hash.service';

describe('PasswordHashService', () => {
  let service: PasswordHashService;

  beforeEach(() => {
    service = new PasswordHashService();
  });

  it('when hashing a password, creates a value that can be matched later', () => {
    const hashedValue = service.hash('super-secret-password');

    expect(hashedValue).toContain(':');
    expect(service.matches('super-secret-password', hashedValue)).toBe(true);
  });

  it('when password does not match, returns false', () => {
    const hashedValue = service.hash('super-secret-password');

    expect(service.matches('different-password', hashedValue)).toBe(false);
  });
});
