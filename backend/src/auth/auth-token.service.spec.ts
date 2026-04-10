import { UnauthorizedException } from '@nestjs/common';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  const originalEnv = process.env;
  let service: AuthTokenService;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret',
      JWT_ACCESS_TTL: '60',
      JWT_REFRESH_TTL: '120',
    };
    service = new AuthTokenService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates and verifies a refresh token', () => {
    const refreshToken = service.createRefreshToken({
      sub: '1',
      email: 'user@example.com',
      tier: 'logged_in',
    });

    const payload = service.verifyRefreshToken(refreshToken.token);

    expect(payload).toEqual({
      sub: '1',
      email: 'user@example.com',
      tier: 'logged_in',
      type: 'refresh',
    });
  });

  it('rejects a tampered token', () => {
    const refreshToken = service.createRefreshToken({
      sub: '1',
      email: 'user@example.com',
      tier: 'logged_in',
    });

    expect(() =>
      service.verifyRefreshToken(`${refreshToken.token}tampered`),
    ).toThrow(UnauthorizedException);
  });
});
