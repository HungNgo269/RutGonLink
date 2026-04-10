import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;
  let prismaService: {
    shortenedLink: {
      findUnique: jest.Mock;
    };
    clickEvent: {
      count: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      shortenedLink: {
        findUnique: jest.fn(),
      },
      clickEvent: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    service = new TrackingService(prismaService as unknown as PrismaService);
  });

  it('when tracking an owned link click, persists the click event', async () => {
    prismaService.clickEvent.create.mockResolvedValue({});

    await service.trackRedirectClick(
      {
        id: BigInt(11),
        userId: BigInt(7),
        organizationId: null,
      },
      {
        referrerUrl: 'https://referrer.example/source',
        ipAddress: '127.0.0.1',
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

  it('when tracking an anonymous link click, skips persistence', async () => {
    await service.trackRedirectClick(
      {
        id: BigInt(11),
        userId: null,
        organizationId: null,
      },
      null,
    );

    expect(prismaService.clickEvent.create).not.toHaveBeenCalled();
  });

  it('when loading tracking for a link owner, returns aggregate clicks', async () => {
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
