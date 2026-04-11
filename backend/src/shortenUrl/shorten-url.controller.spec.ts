import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthCookieService } from '../auth/auth-cookie.service';
import { AuthSessionService } from '../auth/auth-session.service';
import { TrackingService } from '../tracking/tracking.service';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';

describe('ShortenUrlController', () => {
  let controller: ShortenUrlController;
  let service: {
    shorten: jest.MockedFunction<ShortenUrlService['shorten']>;
    getRedirectTarget: jest.MockedFunction<
      ShortenUrlService['getRedirectTarget']
    >;
  };
  let authSessionService: {
    getAuthenticationResult: jest.MockedFunction<
      AuthSessionService['getAuthenticationResult']
    >;
  };
  let authCookieService: {
    hasAuthCookie: jest.MockedFunction<AuthCookieService['hasAuthCookie']>;
    setAccessCookie: jest.MockedFunction<AuthCookieService['setAccessCookie']>;
  };
  let trackingService: {
    trackRedirectClick: jest.MockedFunction<
      TrackingService['trackRedirectClick']
    >;
  };

  beforeEach(async () => {
    service = {
      shorten: jest.fn(),
      getRedirectTarget: jest.fn(),
    };
    authSessionService = {
      getAuthenticationResult: jest.fn(),
    };
    authCookieService = {
      hasAuthCookie: jest.fn(),
      setAccessCookie: jest.fn(),
    };
    trackingService = {
      trackRedirectClick: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenUrlController],
      providers: [
        {
          provide: ShortenUrlService,
          useValue: service,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionService,
        },
        {
          provide: AuthCookieService,
          useValue: authCookieService,
        },
        {
          provide: TrackingService,
          useValue: trackingService,
        },
      ],
    }).compile();

    controller = module.get<ShortenUrlController>(ShortenUrlController);
  });

  it('delegates the creation request to the service', async () => {
    service.shorten.mockResolvedValue({
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      shortenedUrl: 'https://sho.rt/abc1234',
    });
    authSessionService.getAuthenticationResult.mockResolvedValue({
      userId: BigInt(7),
      refreshedAccessToken: null,
    });

    const result = await controller.create(
      { url: 'https://example.com' },
      'https://sho.rt',
      {
        headers: { cookie: 'refresh_token=value' },
      } as never,
      {} as never,
    );

    expect(service.shorten).toHaveBeenCalledWith(
      { url: 'https://example.com' },
      'https://sho.rt',
      BigInt(7),
    );
    expect(result.shortCode).toBe('abc1234');
  });

  it('writes refreshed access token when creation authenticates via refresh token', async () => {
    service.shorten.mockResolvedValue({
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      shortenedUrl: 'https://sho.rt/abc1234',
    });
    authSessionService.getAuthenticationResult.mockResolvedValue({
      userId: BigInt(7),
      refreshedAccessToken: {
        token: 'new-access-token',
        maxAgeMs: 900000,
      },
    });
    const response = {};

    await controller.create(
      { url: 'https://example.com' },
      'https://sho.rt',
      {
        headers: { cookie: 'refresh_token=value' },
      } as never,
      response as never,
    );

    expect(authCookieService.setAccessCookie).toHaveBeenCalledWith(
      response,
      'new-access-token',
      900000,
    );
  });

  it('creates an anonymous link when no auth cookies are present', async () => {
    service.shorten.mockResolvedValue({
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      shortenedUrl: 'https://sho.rt/abc1234',
    });
    authSessionService.getAuthenticationResult.mockResolvedValue(null);
    authCookieService.hasAuthCookie.mockReturnValue(false);

    await controller.create(
      { url: 'https://example.com' },
      'https://sho.rt',
      {
        headers: {},
      } as never,
      {} as never,
    );

    expect(service.shorten).toHaveBeenCalledWith(
      { url: 'https://example.com' },
      'https://sho.rt',
      null,
    );
  });

  it('rejects creation when auth cookies are present but invalid', async () => {
    authSessionService.getAuthenticationResult.mockResolvedValue(null);
    authCookieService.hasAuthCookie.mockReturnValue(true);

    await expect(
      controller.create(
        { url: 'https://example.com' },
        'https://sho.rt',
        {
          headers: { cookie: 'access_token=invalid' },
        } as never,
        {} as never,
      ),
    ).rejects.toThrow(UnauthorizedException);
    expect(service.shorten).not.toHaveBeenCalled();
  });

  it('redirects with the resolved destination url', async () => {
    service.getRedirectTarget.mockResolvedValue({
      id: BigInt(11),
      userId: BigInt(7),
      organizationId: null,
      destinationUrl: 'https://example.com',
    });
    const response = {
      redirect: jest.fn(),
    };

    await controller.redirect(
      'abc1234',
      {
        get: jest.fn().mockReturnValue('https://referrer.example/path'),
        ip: '127.0.0.1',
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0',
        },
      } as never,
      response as never,
    );

    expect(service.getRedirectTarget).toHaveBeenCalledWith('abc1234');
    expect(trackingService.trackRedirectClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: BigInt(11),
      }),
      expect.objectContaining({
        referrerUrl: 'https://referrer.example/path',
        ipAddress: '127.0.0.1',
      }),
    );
    expect(response.redirect).toHaveBeenCalledWith(302, 'https://example.com');
  });
});
