import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';
import { NotFoundException } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: {
    shortenedLink: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    clickEvent: {
      count: jest.Mock;
      findMany: jest.Mock;
      groupBy: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      shortenedLink: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      clickEvent: {
        count: jest.fn(),
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    service = new AnalyticsService(prismaService as unknown as PrismaService);
  });

  it('when loading analytics for a user, returns each owned link with summary metrics', async () => {
    prismaService.shortenedLink.findMany.mockResolvedValue([
      {
        id: BigInt(12),
        shortCode: 'def5678',
        destinationUrl: 'https://example.com/articles/testing',
        createdAt: new Date('2026-04-09T10:00:00.000Z'),
      },
      {
        id: BigInt(11),
        shortCode: 'abc1234',
        destinationUrl: 'https://example.com/articles/nest',
        createdAt: new Date('2026-04-08T10:00:00.000Z'),
      },
    ]);
    prismaService.clickEvent.groupBy.mockResolvedValue([
      {
        linkId: BigInt(11),
        _count: { _all: 3 },
        _max: { clickedAt: new Date('2026-04-10T12:30:00.000Z') },
      },
      {
        linkId: BigInt(12),
        _count: { _all: 1 },
        _max: { clickedAt: new Date('2026-04-10T09:15:00.000Z') },
      },
    ]);

    await expect(
      service.getUserLinkAnalytics(BigInt(7)),
    ).resolves.toMatchObject({
      links: [
        {
          shortCode: 'def5678',
          destinationUrl: 'https://example.com/articles/testing',
          shortenedUrlPath: '/def5678',
          createdAt: '2026-04-09T10:00:00.000Z',
          totalClicks: 1,
          lastClickedAt: '2026-04-10T09:15:00.000Z',
        },
        {
          shortCode: 'abc1234',
          destinationUrl: 'https://example.com/articles/nest',
          shortenedUrlPath: '/abc1234',
          createdAt: '2026-04-08T10:00:00.000Z',
          totalClicks: 3,
          lastClickedAt: '2026-04-10T12:30:00.000Z',
        },
      ],
      totalLinks: 2,
      totalClicks: 4,
    });
  });

  it('when loading analytics for a user with no links, returns an empty summary', async () => {
    prismaService.shortenedLink.findMany.mockResolvedValue([]);

    await expect(service.getUserLinkAnalytics(BigInt(7))).resolves.toEqual({
      links: [],
      totalLinks: 0,
      totalClicks: 0,
    });
    expect(prismaService.clickEvent.groupBy).not.toHaveBeenCalled();
  });

  it('when loading analytics details for an owned link, returns all click metadata for rendering', async () => {
    const createdAt = new Date('2026-04-09T10:00:00.000Z');
    const clickedAt = new Date('2026-04-10T12:30:00.000Z');
    prismaService.shortenedLink.findUnique.mockResolvedValue({
      id: BigInt(11),
      userId: BigInt(7),
      shortCode: 'abc1234',
      destinationUrl: 'https://example.com/articles/nest',
      createdAt,
    });
    prismaService.clickEvent.count.mockResolvedValue(1);
    prismaService.clickEvent.findMany.mockResolvedValue([
      {
        clickedAt,
        referrerUrl: 'https://referrer.example/source',
        referrerDomain: 'referrer.example',
        utmSource: 'newsletter',
        utmMedium: 'email',
        utmCampaign: 'spring-launch',
        utmTerm: 'nestjs',
        utmContent: 'hero-link',
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        ipAddress: '127.0.0.1',
      },
    ]);

    await expect(
      service.getLinkAnalyticsDetail('abc1234', BigInt(7)),
    ).resolves.toMatchObject({
      shortCode: 'abc1234',
      destinationUrl: 'https://example.com/articles/nest',
      shortenedUrlPath: '/abc1234',
      createdAt: createdAt.toISOString(),
      totalClicks: 1,
      clicks: [
        {
          clickedAt: clickedAt.toISOString(),
          referrerUrl: 'https://referrer.example/source',
          referrerDomain: 'referrer.example',
          utmSource: 'newsletter',
          utmMedium: 'email',
          utmCampaign: 'spring-launch',
          utmTerm: 'nestjs',
          utmContent: 'hero-link',
          country: 'Vietnam',
          city: 'Ho Chi Minh City',
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
          ipAddress: '127.0.0.1',
        },
      ],
    });
  });

  it('when loading analytics details for a non-owned link, rejects access', async () => {
    prismaService.shortenedLink.findUnique.mockResolvedValue({
      id: BigInt(11),
      userId: BigInt(8),
      shortCode: 'abc1234',
      destinationUrl: 'https://example.com/articles/nest',
      createdAt: new Date('2026-04-09T10:00:00.000Z'),
    });

    await expect(
      service.getLinkAnalyticsDetail('abc1234', BigInt(7)),
    ).rejects.toThrow(NotFoundException);
    expect(prismaService.clickEvent.findMany).not.toHaveBeenCalled();
  });
});
