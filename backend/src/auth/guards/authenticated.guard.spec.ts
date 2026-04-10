import { ExecutionContext } from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import { AuthenticatedGuard } from './authenticated.guard';

jest.mock('../auth-session.service', () => ({
  AuthSessionService: class AuthSessionService {},
}));

describe('AuthenticatedGuard', () => {
  it('delegates authentication requirement to the session service', async () => {
    const ensureAuthenticatedMock = jest.fn();
    const authSessionService = {
      ensureAuthenticated: ensureAuthenticatedMock,
    } as unknown as jest.Mocked<AuthSessionService>;
    const guard = new AuthenticatedGuard(authSessionService);

    await guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            cookie: 'refresh_token=value',
          },
        }),
      }),
    } as ExecutionContext);

    expect(ensureAuthenticatedMock).toHaveBeenCalledWith('refresh_token=value');
  });
});
