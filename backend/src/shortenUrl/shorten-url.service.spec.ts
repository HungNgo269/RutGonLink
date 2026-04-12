import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ShortenUrlService } from './shorten-url.service';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { nanoid } from 'nanoid';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

const makePrismaService = () => ({
  shortenedLink: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
});

const makeRedisService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
});

describe('ShortenUrlService', () => {
  let service: ShortenUrlService;
  let prismaService: ReturnType<typeof makePrismaService>;
  let redisService: ReturnType<typeof makeRedisService>;

  beforeEach(() => {
    prismaService = makePrismaService();
    redisService = makeRedisService();
    service = new ShortenUrlService(
      prismaService as unknown as PrismaService,
      redisService as unknown as RedisService,
    );
    jest.mocked(nanoid).mockReturnValue('abc1234');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // shorten()
  // ---------------------------------------------------------------------------

  describe('shorten()', () => {
    it('creates a new short link for an anonymous user', async () => {
      const request: CreateShortenUrlDto = {
        url: 'https://example.com/articles/nest',
      };
      prismaService.shortenedLink.findUnique.mockResolvedValue(null);
      prismaService.shortenedLink.create.mockResolvedValue({});

      const result = await service.shorten(request, 'https://sho.rt');

      expect(result).toEqual({
        originalUrl: 'https://example.com/articles/nest',
        shortCode: 'abc1234',
        shortenedUrl: 'https://sho.rt/abc1234',
      });
      expect(prismaService.shortenedLink.findFirst).not.toHaveBeenCalled();
      expect(prismaService.shortenedLink.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shortCode: 'abc1234',
            destinationUrl: 'https://example.com/articles/nest',
          }),
        }),
      );
    });

    it('returns the existing short link when the same user shortens the same URL again', async () => {
      const request: CreateShortenUrlDto = {
        url: 'https://example.com/articles/nest',
      };
      prismaService.shortenedLink.findFirst.mockResolvedValue({
        shortCode: 'existing',
        destinationUrl: 'https://example.com/articles/nest',
      });

      const result = await service.shorten(
        request,
        'https://sho.rt',
        BigInt(7),
      );

      expect(result).toEqual({
        originalUrl: 'https://example.com/articles/nest',
        shortCode: 'existing',
        shortenedUrl: 'https://sho.rt/existing',
      });
      expect(prismaService.shortenedLink.create).not.toHaveBeenCalled();
    });

    it('creates a new short link when the authenticated user has no prior link for this URL', async () => {
      const request: CreateShortenUrlDto = {
        url: 'https://example.com/new-article',
      };
      prismaService.shortenedLink.findFirst.mockResolvedValue(null);
      prismaService.shortenedLink.findUnique.mockResolvedValue(null);
      prismaService.shortenedLink.create.mockResolvedValue({});

      const result = await service.shorten(
        request,
        'https://sho.rt',
        BigInt(7),
      );

      expect(result.shortCode).toBe('abc1234');
      expect(prismaService.shortenedLink.create).toHaveBeenCalled();
    });

    it('throws when the url is invalid', async () => {
      const request: CreateShortenUrlDto = { url: 'not-a-valid-url' };
      await expect(service.shorten(request, 'https://sho.rt')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getRedirectTarget()
  // ---------------------------------------------------------------------------

  describe('getRedirectTarget()', () => {
    const dbLink = {
      id: BigInt(11),
      userId: BigInt(7),
      organizationId: null,
      destinationUrl: 'https://example.com/articles/nest',
      isActive: true,
      expiresAt: null,
    };

    it('returns cached value without touching the DB on cache hit', async () => {
      redisService.get.mockResolvedValue({
        id: '11',
        userId: '7',
        organizationId: null,
        destinationUrl: 'https://example.com/articles/nest',
      });

      const result = await service.getRedirectTarget('abc1234');

      expect(result).toEqual({
        id: BigInt(11),
        userId: BigInt(7),
        organizationId: null,
        destinationUrl: 'https://example.com/articles/nest',
      });
      expect(prismaService.shortenedLink.findUnique).not.toHaveBeenCalled();
    });

    it('queries the DB and writes to cache on cache miss', async () => {
      redisService.get.mockResolvedValue(null);
      prismaService.shortenedLink.findUnique.mockResolvedValue(dbLink);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getRedirectTarget('abc1234');

      expect(result).toEqual(dbLink);
      expect(prismaService.shortenedLink.findUnique).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith(
        'redirect:abc1234',
        expect.objectContaining({ destinationUrl: dbLink.destinationUrl }),
        expect.any(Number),
      );
    });

    it('throws NotFoundException when the short code does not exist', async () => {
      redisService.get.mockResolvedValue(null);
      prismaService.shortenedLink.findUnique.mockResolvedValue(null);

      await expect(service.getRedirectTarget('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(redisService.set).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the link is inactive', async () => {
      redisService.get.mockResolvedValue(null);
      prismaService.shortenedLink.findUnique.mockResolvedValue({
        ...dbLink,
        isActive: false,
      });

      await expect(service.getRedirectTarget('abc1234')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the link has expired', async () => {
      redisService.get.mockResolvedValue(null);
      prismaService.shortenedLink.findUnique.mockResolvedValue({
        ...dbLink,
        expiresAt: new Date(Date.now() - 1000), // 1 second in the past
      });

      await expect(service.getRedirectTarget('abc1234')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('caps the cache TTL at the link expiry when expiresAt is set', async () => {
      redisService.get.mockResolvedValue(null);
      const expiresAt = new Date(Date.now() + 60_000); // expires in 60s
      prismaService.shortenedLink.findUnique.mockResolvedValue({
        ...dbLink,
        expiresAt,
      });
      redisService.set.mockResolvedValue(undefined);

      await service.getRedirectTarget('abc1234');

      const [[, , ttl]] = redisService.set.mock.calls as [
        [string, unknown, number],
      ];
      expect(ttl).toBeLessThanOrEqual(60);
      expect(ttl).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // getDestinationUrl() – thin wrapper, light coverage
  // ---------------------------------------------------------------------------

  describe('getDestinationUrl()', () => {
    it('returns the destination URL for an active short code', async () => {
      redisService.get.mockResolvedValue(null);
      prismaService.shortenedLink.findUnique.mockResolvedValue({
        id: BigInt(11),
        userId: BigInt(7),
        organizationId: null,
        destinationUrl: 'https://example.com/articles/nest',
        isActive: true,
        expiresAt: null,
      });

      await expect(service.getDestinationUrl('abc1234')).resolves.toBe(
        'https://example.com/articles/nest',
      );
    });
  });
});
