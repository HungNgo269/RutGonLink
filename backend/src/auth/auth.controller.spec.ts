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
  let logoutMock: jest.Mock;
  let setAuthCookiesMock: jest.Mock;
  let clearAuthCookiesMock: jest.Mock;

  beforeEach(async () => {
    registerMock = jest.fn();
    loginMock = jest.fn();
    logoutMock = jest.fn();
    setAuthCookiesMock = jest.fn();
    clearAuthCookiesMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: registerMock,
            login: loginMock,
            logout: logoutMock,
          },
        },
        {
          provide: AuthCookieService,
          useValue: {
            setAuthCookies: setAuthCookiesMock,
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
