import { Test, TestingModule } from '@nestjs/testing';
import { AuthCookieService } from '../auth/auth-cookie.service';
import { AuthSessionService } from '../auth/auth-session.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: {
    getUserLinkAnalytics: jest.MockedFunction<
      AnalyticsService['getUserLinkAnalytics']
    >;
    getLinkAnalyticsDetail: jest.MockedFunction<
      AnalyticsService['getLinkAnalyticsDetail']
    >;
  };
  let authSessionService: {
    getAuthenticatedUserId: jest.MockedFunction<
      AuthSessionService['getAuthenticatedUserId']
    >;
    ensureAuthenticated: jest.MockedFunction<
      AuthSessionService['ensureAuthenticated']
    >;
  };

  beforeEach(async () => {
    analyticsService = {
      getUserLinkAnalytics: jest.fn(),
      getLinkAnalyticsDetail: jest.fn(),
    };
    authSessionService = {
      getAuthenticatedUserId: jest.fn(),
      ensureAuthenticated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: analyticsService,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionService,
        },
        {
          provide: AuthCookieService,
          useValue: {
            setAccessCookie: jest.fn(),
          },
        },
        AuthenticatedGuard,
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('returns link analytics for the authenticated user', async () => {
    analyticsService.getUserLinkAnalytics.mockResolvedValue({
      links: [
        {
          shortCode: 'abc1234',
          destinationUrl: 'https://example.com',
          shortenedUrlPath: '/abc1234',
          createdAt: '2026-04-10T10:00:00.000Z',
          totalClicks: 2,
          lastClickedAt: '2026-04-10T12:00:00.000Z',
        },
      ],
      totalLinks: 1,
      totalClicks: 2,
    });

    const result = await controller.getUserLinkAnalytics({
      userId: BigInt(7),
    } as never);

    expect(analyticsService.getUserLinkAnalytics).toHaveBeenCalledWith(
      BigInt(7),
    );
    expect(result.totalLinks).toBe(1);
  });

  it('returns link analytics details for the authenticated user', async () => {
    analyticsService.getLinkAnalyticsDetail.mockResolvedValue({
      shortCode: 'abc1234',
      destinationUrl: 'https://example.com',
      shortenedUrlPath: '/abc1234',
      createdAt: '2026-04-10T10:00:00.000Z',
      totalClicks: 1,
      clicks: [
        {
          clickedAt: '2026-04-10T12:00:00.000Z',
          referrerUrl: 'https://referrer.example/source',
          referrerDomain: 'referrer.example',
          utmSource: 'newsletter',
          utmMedium: 'email',
          utmCampaign: 'spring-launch',
          utmTerm: null,
          utmContent: null,
          country: 'Vietnam',
          city: 'Ho Chi Minh City',
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
          ipAddress: '127.0.0.1',
        },
      ],
    });

    const result = await controller.getLinkAnalyticsDetail('abc1234', {
      userId: BigInt(7),
    } as never);

    expect(analyticsService.getLinkAnalyticsDetail).toHaveBeenCalledWith(
      'abc1234',
      BigInt(7),
    );
    expect(result.clicks).toHaveLength(1);
  });
});
