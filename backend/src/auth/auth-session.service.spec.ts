import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { PasswordHashService } from './password-hash.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
    };
  };
  let authCookieService: jest.Mocked<AuthCookieService>;
  let authTokenService: jest.Mocked<AuthTokenService>;
  let passwordHashService: jest.Mocked<PasswordHashService>;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    };
    authCookieService = {
      readAccessToken: jest.fn(),
      readRefreshToken: jest.fn(),
      clearAuthCookies: jest.fn(),
      setAccessCookie: jest.fn(),
      setAuthCookies: jest.fn(),
    } as unknown as jest.Mocked<AuthCookieService>;
    authTokenService = {
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      createAccessToken: jest.fn(),
      createRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<AuthTokenService>;
    passwordHashService = {
      hash: jest.fn(),
      matches: jest.fn(),
    } as unknown as jest.Mocked<PasswordHashService>;

    service = new AuthSessionService(
      prismaService as unknown as PrismaService,
      authCookieService,
      authTokenService,
      passwordHashService,
    );
  });

  it('when access token is valid, treats the request as authenticated', async () => {
    authCookieService.readAccessToken.mockReturnValue('access-token');
    authTokenService.verifyAccessToken.mockReturnValue({
      sub: '1',
      email: 'user@example.com',
      tier: 'logged_in',
      type: 'access',
    });

    await expect(
      service.ensureGuest('access_token=access-token'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('when refresh token is stored and valid, authenticates the request', async () => {
    authCookieService.readAccessToken.mockReturnValue(null);
    authCookieService.readRefreshToken.mockReturnValue('refresh-token');
    authTokenService.verifyRefreshToken.mockReturnValue({
      sub: '7',
      email: 'user@example.com',
      tier: 'logged_in',
      type: 'refresh',
    });
    prismaService.user.findUnique.mockResolvedValue({
      refreshTokenHash: 'stored-hash',
    });
    passwordHashService.matches.mockReturnValue(true);

    await expect(
      service.ensureAuthenticated('refresh_token=refresh-token'),
    ).resolves.toBeUndefined();
  });

  it('when access token is valid, returns the authenticated user id', async () => {
    authCookieService.readAccessToken.mockReturnValue('access-token');
    authTokenService.verifyAccessToken.mockReturnValue({
      sub: '42',
      email: 'user@example.com',
      tier: 'logged_in',
      type: 'access',
    });

    await expect(
      service.getAuthenticatedUserId('access_token=access-token'),
    ).resolves.toBe(BigInt(42));
  });

  it('when access token is valid, returns an access session source', async () => {
    authCookieService.readAccessToken.mockReturnValue('access-token');
    authTokenService.verifyAccessToken.mockReturnValue({
      sub: '42',
      email: 'user@example.com',
      tier: 'logged_in',
      type: 'access',
    });

    await expect(
      service.getAuthenticatedSession('access_token=access-token'),
    ).resolves.toEqual({
      source: 'access',
      userId: BigInt(42),
    });
  });

  it('when access token fails but refresh token is valid, returns a refresh session source', async () => {
    authCookieService.readAccessToken.mockReturnValue('expired-access-token');
    authTokenService.verifyAccessToken.mockImplementation(() => {
      throw new UnauthorizedException('Invalid token.');
    });
    authCookieService.readRefreshToken.mockReturnValue('refresh-token');
    authTokenService.verifyRefreshToken.mockReturnValue({
      sub: '7',
      email: 'user@example.com',
      tier: 'logged_in',
      type: 'refresh',
    });
    prismaService.user.findUnique.mockResolvedValue({
      refreshTokenHash: 'stored-hash',
    });
    passwordHashService.matches.mockReturnValue(true);

    await expect(
      service.getAuthenticatedSession(
        'access_token=expired-access-token; refresh_token=refresh-token',
      ),
    ).resolves.toEqual({
      source: 'refresh',
      userId: BigInt(7),
    });
  });

  it('when no valid session exists, rejects authenticated-only access', async () => {
    authCookieService.readAccessToken.mockReturnValue(null);
    authCookieService.readRefreshToken.mockReturnValue(null);

    await expect(service.ensureAuthenticated(undefined)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('when no valid session exists, returns null user id', async () => {
    authCookieService.readAccessToken.mockReturnValue(null);
    authCookieService.readRefreshToken.mockReturnValue(null);

    await expect(service.getAuthenticatedUserId(undefined)).resolves.toBeNull();
  });
});
