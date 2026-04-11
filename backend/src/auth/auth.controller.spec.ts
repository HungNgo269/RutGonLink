import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthSessionService } from './auth-session.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('AuthController', () => {
  let controller: AuthController;
  let registerMock: jest.Mock;
  let loginMock: jest.Mock;
  let getCurrentUserMock: jest.Mock;
  let logoutMock: jest.Mock;
  let issueAccessTokenMock: jest.Mock;
  let setAuthCookiesMock: jest.Mock;
  let setAccessCookieMock: jest.Mock;
  let clearAuthCookiesMock: jest.Mock;

  beforeEach(async () => {
    registerMock = jest.fn();
    loginMock = jest.fn();
    getCurrentUserMock = jest.fn();
    logoutMock = jest.fn();
    issueAccessTokenMock = jest.fn();
    setAuthCookiesMock = jest.fn();
    setAccessCookieMock = jest.fn();
    clearAuthCookiesMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: registerMock,
            login: loginMock,
            getCurrentUser: getCurrentUserMock,
            issueAccessToken: issueAccessTokenMock,
            logout: logoutMock,
          },
        },
        {
          provide: AuthCookieService,
          useValue: {
            setAuthCookies: setAuthCookiesMock,
            setAccessCookie: setAccessCookieMock,
            clearAuthCookies: clearAuthCookiesMock,
          },
        },
        {
          provide: AuthSessionService,
          useValue: {
            ensureAuthenticated: jest.fn(),
            ensureGuest: jest.fn(),
            validateStoredRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates register and writes auth cookies', async () => {
    registerMock.mockResolvedValue({
      user: {
        id: '1',
        email: 'user@example.com',
        fullName: 'User Name',
        tier: 'logged_in',
      },
      accessToken: 'access-token',
      accessTokenMaxAgeMs: 1000,
      refreshToken: 'refresh-token',
      refreshTokenMaxAgeMs: 2000,
    });
    const response = { cookie: jest.fn() } as unknown as Response;

    const result = await controller.register(
      {
        email: 'user@example.com',
        fullName: 'User Name',
        password: 'super-secret-password',
      },
      response,
    );

    expect(setAuthCookiesMock).toHaveBeenCalledWith(
      response,
      'access-token',
      1000,
      'refresh-token',
      2000,
    );
    expect(result.user.email).toBe('user@example.com');
  });

  it('returns the current authenticated user', async () => {
    getCurrentUserMock.mockResolvedValue({
      user: {
        id: '7',
        email: 'user@example.com',
        fullName: 'User Name',
        tier: 'logged_in',
      },
    });

    const response = { cookie: jest.fn() } as unknown as Response;
    const result = await controller.me(
      {
        authSessionSource: 'access',
        userId: BigInt(7),
      } as never,
      response,
    );

    expect(getCurrentUserMock).toHaveBeenCalledWith(BigInt(7));
    expect(setAccessCookieMock).not.toHaveBeenCalled();
    expect(result.user.email).toBe('user@example.com');
  });

  it('refreshes the access cookie when current user was authenticated by refresh token', async () => {
    const user = {
      id: '7',
      email: 'user@example.com',
      fullName: 'User Name',
      tier: 'logged_in',
    };
    getCurrentUserMock.mockResolvedValue({ user });
    issueAccessTokenMock.mockReturnValue({
      accessToken: 'new-access-token',
      accessTokenMaxAgeMs: 1000,
    });
    const response = { cookie: jest.fn() } as unknown as Response;

    const result = await controller.me(
      {
        authSessionSource: 'refresh',
        userId: BigInt(7),
      } as never,
      response,
    );

    expect(issueAccessTokenMock).toHaveBeenCalledWith(user);
    expect(setAccessCookieMock).toHaveBeenCalledWith(
      response,
      'new-access-token',
      1000,
    );
    expect(result.user.id).toBe('7');
  });

  it('delegates logout, then clears auth cookies', async () => {
    const response = { clearCookie: jest.fn() } as unknown as Response;

    const result = await controller.logout(
      {
        headers: {
          cookie: 'refresh_token=refresh-token',
        },
      } as never,
      response,
    );

    expect(logoutMock).toHaveBeenCalledWith('refresh_token=refresh-token');
    expect(clearAuthCookiesMock).toHaveBeenCalledWith(response);
    expect(result).toEqual({ success: true });
  });
});
