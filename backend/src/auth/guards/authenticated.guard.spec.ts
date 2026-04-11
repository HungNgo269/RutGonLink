import { ExecutionContext } from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import { AuthenticatedGuard } from './authenticated.guard';

jest.mock('../auth-session.service', () => ({
  AuthSessionService: class AuthSessionService {},
}));

describe('AuthenticatedGuard', () => {
  it('stores authenticated user id on the request', async () => {
    const getAuthenticatedSessionMock = jest.fn().mockResolvedValue({
      source: 'refresh',
      userId: BigInt(7),
    });
    const authSessionService = {
      getAuthenticatedSession: getAuthenticatedSessionMock,
      ensureAuthenticated: jest.fn(),
    } as unknown as jest.Mocked<AuthSessionService>;
    const guard = new AuthenticatedGuard(authSessionService);
    const request = {
      headers: {
        cookie: 'refresh_token=value',
      },
    };

    await guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext);

    expect(getAuthenticatedSessionMock).toHaveBeenCalledWith(
      'refresh_token=value',
    );
    expect(request).toEqual(
      expect.objectContaining({
        authSessionSource: 'refresh',
        userId: BigInt(7),
      }),
    );
  });
});
