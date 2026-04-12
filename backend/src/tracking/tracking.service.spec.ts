import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;
  let prismaService: {
    shortenedLink: { findUnique: jest.Mock };
    clickEvent: { count: jest.Mock; create: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(() => {
    prismaService = {
      shortenedLink: { findUnique: jest.fn() },
      clickEvent: { count: jest.fn(), create: jest.fn(), findMany: jest.fn() },
    };
    service = new TrackingService(prismaService as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('when tracking an owned link click, persists the click event', async () => {
    prismaService.clickEvent.create.mockResolvedValue({});

    await service.trackRedirectClick(
      {
        id: BigInt(11),
        userId: BigInt(7),
        organizationId: null,
        destinationUrl: 'https://example.com/articles/nest',
      },
      {
        referrerUrl: 'https://referrer.example/source',
        ipAddress: '127.0.0.1',
        forwardedFor: null,
        realIp: null,
        requestUrl: '/abc1234',
        country: null,
        city: null,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0',
      },
    );

    expect(prismaService.clickEvent.create).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        linkId: BigInt(11),
        userId: BigInt(7),
        referrerUrl: 'https://referrer.example/source',
        referrerDomain: 'referrer.example',
        ipAddress: '127.0.0.1',
      }),
    });
  });

  it('when CDN headers provide city and country, persists them on the click event', async () => {
    prismaService.clickEvent.create.mockResolvedValue({});

    await service.trackRedirectClick(
      {
        id: BigInt(11),
        userId: BigInt(7),
        organizationId: null,
        destinationUrl:
          'https://example.com/articles/nest?utm_source=destination&utm_medium=social',
      },
      {
        referrerUrl: 'https://social.example/posts/launch',
        ipAddress: '10.0.0.1',
        forwardedFor: '203.0.113.10, 10.0.0.1',
        realIp: '198.51.100.8',
        requestUrl:
          '/abc1234?utm_source=newsletter&utm_medium=email&utm_campaign=spring-launch&utm_term=nest&utm_content=hero',
        country: 'VN',
        city: 'Ho%20Chi%20Minh%20City',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    );

    expect(prismaService.clickEvent.create).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        linkId: BigInt(11),
        userId: BigInt(7),
        referrerUrl: 'https://social.example/posts/launch',
        referrerDomain: 'social.example',
        utmSource: 'newsletter',
        utmMedium: 'email',
        utmCampaign: 'spring-launch',
        utmTerm: 'nest',
        utmContent: 'hero',
        country: 'VN',
        city: 'Ho Chi Minh City',
        deviceType: 'mobile',
        browser: 'Safari',
        os: 'iOS',
        ipAddress: '203.0.113.10',
      }),
    });
  });

  it('when tracking an anonymous link click, skips persistence', async () => {
    await service.trackRedirectClick(
      {
        id: BigInt(11),
        userId: null,
        organizationId: null,
        destinationUrl: 'https://example.com/articles/nest',
      },
      null,
    );

    expect(prismaService.clickEvent.create).not.toHaveBeenCalled();
  });

  it('when the destination url has campaign data, uses it as a fallback', async () => {
    prismaService.clickEvent.create.mockResolvedValue({});

    await service.trackRedirectClick(
      {
        id: BigInt(11),
        userId: BigInt(7),
        organizationId: null,
        destinationUrl:
          'https://example.com/articles/nest?utm_source=linkedin&utm_medium=social&utm_campaign=launch',
      },
      {
        referrerUrl: null,
        ipAddress: null,
        forwardedFor: null,
        realIp: null,
        requestUrl: '/abc1234',
        country: null,
        city: null,
        userAgent: null,
      },
    );

    expect(prismaService.clickEvent.create).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        utmSource: 'linkedin',
        utmMedium: 'social',
        utmCampaign: 'launch',
      }),
    });
  });

  it('when loading tracking for a link owner, returns aggregate clicks with city and country', async () => {
    const clickedAt = new Date('2026-04-10T10:00:00.000Z');
    prismaService.shortenedLink.findUnique.mockResolvedValue({
      id: BigInt(11),
      userId: BigInt(7),
      destinationUrl: 'https://example.com/articles/nest',
    });
    prismaService.clickEvent.count.mockResolvedValue(2);
    prismaService.clickEvent.findMany.mockResolvedValue([
      {
        clickedAt,
        referrerDomain: 'referrer.example',
        browser: 'Chrome',
        os: 'Windows',
        deviceType: 'desktop',
        ipAddress: '127.0.0.1',
        city: 'Hanoi',
        country: 'Vietnam',
      },
    ]);

    await expect(service.getTracking('abc1234', BigInt(7))).resolves.toEqual({
      shortCode: 'abc1234',
      destinationUrl: 'https://example.com/articles/nest',
      totalClicks: 2,
      recentClicks: [
        {
          clickedAt: clickedAt.toISOString(),
          referrerDomain: 'referrer.example',
          browser: 'Chrome',
          os: 'Windows',
          deviceType: 'desktop',
          ipAddress: '127.0.0.1',
          city: 'Hanoi',
          country: 'Vietnam',
        },
      ],
    });
  });

  it('when loading tracking for a non-owner, rejects access', async () => {
    prismaService.shortenedLink.findUnique.mockResolvedValue({
      id: BigInt(11),
      userId: BigInt(8),
      destinationUrl: 'https://example.com/articles/nest',
    });

    await expect(service.getTracking('abc1234', BigInt(7))).rejects.toThrow(
      NotFoundException,
    );
  });
});
