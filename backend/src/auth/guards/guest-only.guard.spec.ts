import { ExecutionContext } from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import { GuestOnlyGuard } from './guest-only.guard';

jest.mock('../auth-session.service', () => ({
  AuthSessionService: class AuthSessionService {},
}));

describe('GuestOnlyGuard', () => {
  it('delegates guest-only requirement to the session service', async () => {
    const ensureGuestMock = jest.fn();
    const authSessionService = {
      ensureGuest: ensureGuestMock,
    } as unknown as jest.Mocked<AuthSessionService>;
    const guard = new GuestOnlyGuard(authSessionService);

    await guard.canActivate({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            cookie: 'access_token=value',
          },
        }),
      }),
    } as ExecutionContext);

    expect(ensureGuestMock).toHaveBeenCalledWith('access_token=value');
  });
});
