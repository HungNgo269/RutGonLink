import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserTier } from '@prisma/client';
import { AuthSessionService } from './auth-session.service';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { PasswordHashService } from './password-hash.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('AuthService', () => {
  let service: AuthService;
  let findUniqueMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let passwordHashService: jest.Mocked<PasswordHashService>;
  let authTokenService: jest.Mocked<AuthTokenService>;
  let authSessionService: jest.Mocked<AuthSessionService>;
  let hashMock: jest.Mock;
  let matchesMock: jest.Mock;
  let createAccessTokenMock: jest.Mock;
  let createRefreshTokenMock: jest.Mock;
  let validateStoredRefreshTokenMock: jest.Mock;

  beforeEach(() => {
    findUniqueMock = jest.fn();
    createMock = jest.fn();
    updateMock = jest.fn();
    prismaService = {
      user: {
        findUnique: findUniqueMock,
        create: createMock,
        update: updateMock,
      },
    };
    hashMock = jest.fn();
    matchesMock = jest.fn();
    passwordHashService = {
      hash: hashMock,
      matches: matchesMock,
    } as unknown as jest.Mocked<PasswordHashService>;
    createAccessTokenMock = jest.fn();
    createRefreshTokenMock = jest.fn();
    authTokenService = {
      createAccessToken: createAccessTokenMock,
      createRefreshToken: createRefreshTokenMock,
      verifyRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
    } as unknown as jest.Mocked<AuthTokenService>;
    validateStoredRefreshTokenMock = jest.fn();
    authSessionService = {
      ensureAuthenticated: jest.fn(),
      ensureGuest: jest.fn(),
      validateStoredRefreshToken: validateStoredRefreshTokenMock,
    } as unknown as jest.Mocked<AuthSessionService>;

    service = new AuthService(
      prismaService as never,
      passwordHashService,
      authTokenService,
      authSessionService,
    );
  });

  it('when registering a new user, persists hashed password and hashed refresh token', async () => {
    findUniqueMock.mockResolvedValue(null);
    hashMock
      .mockReturnValueOnce('password-hash')
      .mockReturnValueOnce('refresh-hash');
    createAccessTokenMock.mockReturnValue({
      token: 'access-token',
      expiresInSeconds: 900,
    });
    createRefreshTokenMock.mockReturnValue({
      token: 'refresh-token',
      expiresInSeconds: 604800,
    });
    createMock.mockResolvedValue({
      id: BigInt(1),
      email: 'user@example.com',
      fullName: 'User Name',
      tier: UserTier.logged_in,
    });

    const result = await service.register({
      email: 'USER@example.com',
      fullName: 'User Name',
      password: 'super-secret-password',
    });

    const createCall = createMock.mock.calls[0] as [
      {
        data: {
          email: string;
          fullName: string;
          passwordHash: string;
          refreshTokenHash: string;
        };
      },
    ];
    const createArguments = createCall[0];

    expect(createArguments.data.email).toBe('user@example.com');
    expect(createArguments.data.fullName).toBe('User Name');
    expect(createArguments.data.passwordHash).toBe('password-hash');
    expect(createArguments.data.refreshTokenHash).toBe('refresh-hash');
    expect(result.user.email).toBe('user@example.com');
    expect(result.refreshToken).toBe('refresh-token');
  });

  it('when credentials are invalid, rejects login', async () => {
    findUniqueMock.mockResolvedValue({
      id: BigInt(1),
      email: 'user@example.com',
      fullName: 'User Name',
      tier: UserTier.logged_in,
      passwordHash: 'stored-hash',
      isActive: true,
    });
    matchesMock.mockReturnValue(false);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('when email already exists, rejects registration', async () => {
    findUniqueMock.mockResolvedValue({ id: BigInt(1) });

    await expect(
      service.register({
        email: 'user@example.com',
        fullName: 'User Name',
        password: 'super-secret-password',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('when logout receives a valid refresh token, clears the stored hash', async () => {
    validateStoredRefreshTokenMock.mockResolvedValue({
      userId: BigInt(7),
    });
    updateMock.mockResolvedValue({});

    await service.logout('refresh_token=refresh-token');

    expect(validateStoredRefreshTokenMock).toHaveBeenCalledWith(
      'refresh_token=refresh-token',
    );
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: BigInt(7) },
      data: { refreshTokenHash: null },
    });
  });

  it('when logout session is invalid, does not update the user', async () => {
    validateStoredRefreshTokenMock.mockResolvedValue(null);

    await service.logout('refresh_token=invalid');

    expect(updateMock).not.toHaveBeenCalled();
  });
});
