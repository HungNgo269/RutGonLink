import { ExecutionContext } from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import { AuthenticatedGuard } from './authenticated.guard';

jest.mock('../auth-session.service', () => ({
  AuthSessionService: class AuthSessionService {},
}));

describe('AuthenticatedGuard', () => {
  it('stores authenticated user id on the request', async () => {
    const getAuthenticationResultMock = jest.fn().mockResolvedValue({
      userId: BigInt(7),
      refreshedAccessToken: null,
    });
    const authSessionService = {
      getAuthenticationResult: getAuthenticationResultMock,
      ensureAuthenticated: jest.fn(),
    } as unknown as jest.Mocked<AuthSessionService>;
    const authCookieService = {
      setAccessCookie: jest.fn(),
    };
    const guard = new AuthenticatedGuard(
      authSessionService,
      authCookieService as never,
    );
    const request = {
      headers: {
        cookie: 'refresh_token=value',
      },
    };

    await guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
      }),
    } as ExecutionContext);

    expect(getAuthenticationResultMock).toHaveBeenCalledWith(
      'refresh_token=value',
    );
    expect(request).toEqual(
      expect.objectContaining({
        userId: BigInt(7),
      }),
    );
  });

  it('writes a refreshed access token when authentication was recovered from refresh token', async () => {
    const authSessionService = {
      getAuthenticationResult: jest.fn().mockResolvedValue({
        userId: BigInt(7),
        refreshedAccessToken: {
          token: 'new-access-token',
          maxAgeMs: 900000,
        },
      }),
    } as unknown as jest.Mocked<AuthSessionService>;
    const authCookieService = {
      setAccessCookie: jest.fn(),
    };
    const guard = new AuthenticatedGuard(
      authSessionService,
      authCookieService as never,
    );
    const response = {};

    await guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            cookie: 'refresh_token=value',
          },
        }),
        getResponse: () => response,
      }),
    } as ExecutionContext);

    expect(authCookieService.setAccessCookie).toHaveBeenCalledWith(
      response,
      'new-access-token',
      900000,
    );
  });
});
