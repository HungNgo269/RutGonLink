import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';
import { NotFoundException } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: {
    $queryRaw: jest.Mock;
    shortenedLink: {
      count: jest.Mock;
      delete: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    clickEvent: {
      count: jest.Mock;
      groupBy: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      $queryRaw: jest.fn(),
      shortenedLink: {
        count: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      clickEvent: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    service = new AnalyticsService(prismaService as unknown as PrismaService);
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2026-04-12T00:00:00.000Z').getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('when loading analytics for a user, returns each owned link with summary metrics', async () => {
    prismaService.shortenedLink.count.mockResolvedValue(12);
    prismaService.shortenedLink.findMany.mockResolvedValue([
      {
        id: BigInt(12),
        shortCode: 'def5678',
        destinationUrl: 'https://example.com/articles/testing',
        createdAt: new Date('2026-04-09T10:00:00.000Z'),
        expiresAt: null,
      },
      {
        id: BigInt(11),
        shortCode: 'abc1234',
        destinationUrl: 'https://example.com/articles/nest',
        createdAt: new Date('2026-04-08T10:00:00.000Z'),
        expiresAt: new Date('2026-05-08T10:00:00.000Z'),
      },
    ]);
    prismaService.clickEvent.count.mockResolvedValue(9);
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
      service.getUserLinkAnalytics(BigInt(7), {
        page: 2,
        limit: 10,
        search: 'example',
        expires: 'expiring',
      }),
    ).resolves.toMatchObject({
      links: [
        {
          shortCode: 'def5678',
          destinationUrl: 'https://example.com/articles/testing',
          shortenedUrlPath: '/def5678',
          createdAt: '2026-04-09T10:00:00.000Z',
          expiresAt: null,
          totalClicks: 1,
          lastClickedAt: '2026-04-10T09:15:00.000Z',
        },
        {
          shortCode: 'abc1234',
          destinationUrl: 'https://example.com/articles/nest',
          shortenedUrlPath: '/abc1234',
          createdAt: '2026-04-08T10:00:00.000Z',
          expiresAt: '2026-05-08T10:00:00.000Z',
          totalClicks: 3,
          lastClickedAt: '2026-04-10T12:30:00.000Z',
        },
      ],
      totalLinks: 12,
      totalClicks: 9,
      page: 2,
      limit: 10,
      totalPages: 2,
    });
    type FindManyArgs = {
      where: {
        AND?: Array<Record<string, unknown>>;
        userId: bigint;
      };
      skip: number;
      take: number;
    };

    const findManyCalls = prismaService.shortenedLink.findMany.mock
      .calls as Array<[FindManyArgs]>;
    const findManyCall = findManyCalls[0]?.[0];

    expect(findManyCall).toBeDefined();
    if (!findManyCall) {
      throw new Error('Expected findMany to be called');
    }

    expect(findManyCall.skip).toBe(10);
    expect(findManyCall.take).toBe(10);
    expect(findManyCall.where.userId).toBe(BigInt(7));
    expect(findManyCall.where.AND).toHaveLength(2);
    expect(findManyCall.where.AND?.[0]).toHaveProperty('OR');
    expect(findManyCall.where.AND?.[1]).toEqual({
      expiresAt: { gt: new Date('2026-04-12T00:00:00.000Z') },
    });
  });

  it('when loading analytics for a user with no links, returns an empty summary', async () => {
    prismaService.shortenedLink.count.mockResolvedValue(0);
    prismaService.shortenedLink.findMany.mockResolvedValue([]);
    prismaService.clickEvent.count.mockResolvedValue(0);

    await expect(service.getUserLinkAnalytics(BigInt(7))).resolves.toEqual({
      links: [],
      totalLinks: 0,
      totalClicks: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
    expect(prismaService.clickEvent.groupBy).not.toHaveBeenCalled();
  });

  it('when deleting an owned link, removes the link', async () => {
    prismaService.shortenedLink.findUnique.mockResolvedValue({
      shortCode: 'abc1234',
      userId: BigInt(7),
    });
    prismaService.shortenedLink.delete.mockResolvedValue({
      shortCode: 'abc1234',
    });

    await expect(
      service.deleteUserShortenedLink('abc1234', BigInt(7)),
    ).resolves.toEqual({
      shortCode: 'abc1234',
      deleted: true,
    });
    expect(prismaService.shortenedLink.delete).toHaveBeenCalledWith({
      where: { shortCode: 'abc1234' },
    });
  });

  it('when deleting a non-owned link, rejects access', async () => {
    prismaService.shortenedLink.findUnique.mockResolvedValue({
      shortCode: 'abc1234',
      userId: BigInt(8),
    });

    await expect(
      service.deleteUserShortenedLink('abc1234', BigInt(7)),
    ).rejects.toThrow(NotFoundException);
    expect(prismaService.shortenedLink.delete).not.toHaveBeenCalled();
  });

  it('when loading analytics details for an owned link, returns aggregate metrics for rendering', async () => {
    const createdAt = new Date('2026-04-09T10:00:00.000Z');
    prismaService.shortenedLink.findUnique.mockResolvedValue({
      id: BigInt(11),
      userId: BigInt(7),
      shortCode: 'abc1234',
      destinationUrl: 'https://example.com/articles/nest',
      createdAt,
    });
    prismaService.clickEvent.count.mockResolvedValue(1);
    prismaService.$queryRaw
      .mockResolvedValueOnce([{ date: '2026-04-10', totalClicks: 1 }])
      .mockResolvedValueOnce([
        { label: 'Ho Chi Minh City, Vietnam', totalClicks: 1 },
      ])
      .mockResolvedValueOnce([{ label: 'referrer.example', totalClicks: 1 }])
      .mockResolvedValueOnce([{ label: 'Laptop / PC', totalClicks: 1 }]);

    const result = await service.getLinkAnalyticsDetail('abc1234', BigInt(7));

    expect(result).toMatchObject({
      shortCode: 'abc1234',
      destinationUrl: 'https://example.com/articles/nest',
      shortenedUrlPath: '/abc1234',
      createdAt: createdAt.toISOString(),
      totalClicks: 1,
      locations: [
        {
          label: 'Ho Chi Minh City, Vietnam',
          totalClicks: 1,
          percentage: 100,
        },
      ],
      referrers: [
        {
          label: 'referrer.example',
          totalClicks: 1,
          percentage: 100,
        },
      ],
      devices: [
        {
          label: 'Laptop / PC',
          totalClicks: 1,
          percentage: 100,
        },
      ],
    });
    expect(result.engagementsOverTime).toContainEqual({
      date: '2026-04-10',
      totalClicks: 1,
    });
    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(4);
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
    expect(prismaService.clickEvent.count).not.toHaveBeenCalled();
    expect(prismaService.$queryRaw).not.toHaveBeenCalled();
  });
});
