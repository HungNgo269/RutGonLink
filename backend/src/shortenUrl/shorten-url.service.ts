import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LinkCreatorType } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { ShortenedUrlDto } from './dto/shortened-url.dto';

const REDIS_REDIRECT_PREFIX = 'redirect:';
const DEFAULT_CACHE_TTL_S = 3600; // 1 hour

interface CachedRedirectTarget {
  id: string; // stored as string because JSON doesn't support BigInt
  userId: string | null;
  organizationId: string | null;
  destinationUrl: string;
}

@Injectable()
export class ShortenUrlService {
  private readonly logger = new Logger(ShortenUrlService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async shorten(
    request: CreateShortenUrlDto,
    baseUrl: string,
    authenticatedUserId: bigint | null = null,
  ): Promise<ShortenedUrlDto> {
    const originalUrl = this.parseUrl(request.url);

    // --- Deduplication: return existing link if same user + URL already exists ---
    if (authenticatedUserId !== null) {
      const existing = await this.prismaService.shortenedLink.findFirst({
        where: {
          userId: authenticatedUserId,
          destinationUrl: originalUrl,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        select: {
          shortCode: true,
          destinationUrl: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        this.logger.log(
          `Dedup hit: returning existing short code "${existing.shortCode}" for user ${authenticatedUserId}`,
        );
        return new ShortenedUrlDto(
          existing.destinationUrl,
          existing.shortCode,
          `${baseUrl}/${existing.shortCode}`,
        );
      }
    }

    // --- Create new short link ---
    const shortCode = await this.createUniqueShortCode();

    await this.prismaService.shortenedLink.create({
      data: {
        id: this.createShortenedLinkId(),
        shortCode,
        destinationUrl: originalUrl,
        ...(authenticatedUserId === null
          ? {}
          : {
              userId: authenticatedUserId,
              createdByType: LinkCreatorType.user,
            }),
      },
    });

    return new ShortenedUrlDto(
      originalUrl,
      shortCode,
      `${baseUrl}/${shortCode}`,
    );
  }

  async getDestinationUrl(shortCode: string): Promise<string> {
    const shortenedLink = await this.getRedirectTarget(shortCode);

    return shortenedLink.destinationUrl;
  }

  async getRedirectTarget(shortCode: string): Promise<{
    id: bigint;
    userId: bigint | null;
    organizationId: bigint | null;
    destinationUrl: string;
  }> {
    const cacheKey = `${REDIS_REDIRECT_PREFIX}${shortCode}`;

    // --- Cache-first: check Redis ---
    const cached =
      await this.redisService.get<CachedRedirectTarget>(cacheKey);

    if (cached) {
      this.logger.log(`Cache hit for short code "${shortCode}"`);
      return {
        id: BigInt(cached.id),
        userId: cached.userId !== null ? BigInt(cached.userId) : null,
        organizationId:
          cached.organizationId !== null
            ? BigInt(cached.organizationId)
            : null,
        destinationUrl: cached.destinationUrl,
      };
    }

    // --- Cache miss: query DB ---
    const shortenedLink = await this.prismaService.shortenedLink.findUnique({
      where: { shortCode },
      select: {
        id: true,
        organizationId: true,
        userId: true,
        destinationUrl: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (
      !shortenedLink ||
      !shortenedLink.isActive ||
      (shortenedLink.expiresAt &&
        shortenedLink.expiresAt.getTime() <= Date.now())
    ) {
      throw new NotFoundException('Short link not found.');
    }

    // --- Write to Redis with smart TTL ---
    const cacheTtl = this.computeCacheTtl(shortenedLink.expiresAt);
    const toCache: CachedRedirectTarget = {
      id: shortenedLink.id.toString(),
      userId: shortenedLink.userId?.toString() ?? null,
      organizationId: shortenedLink.organizationId?.toString() ?? null,
      destinationUrl: shortenedLink.destinationUrl,
    };
    await this.redisService.set(cacheKey, toCache, cacheTtl);

    return shortenedLink;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Computes the Redis TTL in seconds.
   * Uses the lesser of the configured default TTL and the time remaining
   * until the link's expiresAt so the cache auto-evicts when the link expires.
   */
  private computeCacheTtl(expiresAt: Date | null): number {
    const defaultTtl = Number(
      process.env.REDIS_CACHE_TTL_S ?? DEFAULT_CACHE_TTL_S,
    );

    if (!expiresAt) {
      return defaultTtl;
    }

    const secondsUntilExpiry = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000,
    );

    return Math.min(defaultTtl, Math.max(1, secondsUntilExpiry));
  }

  private parseUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new BadRequestException('Invalid URL format.');
      }

      return parsedUrl.toString();
    } catch {
      throw new BadRequestException('Invalid URL format.');
    }
  }

  private async createUniqueShortCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const shortCode = nanoid(7);
      const existingLink = await this.prismaService.shortenedLink.findUnique({
        where: { shortCode },
        select: { id: true },
      });

      if (!existingLink) {
        return shortCode;
      }
    }

    throw new BadRequestException(
      'Unable to create a unique short link. Please try again.',
    );
  }

  private createShortenedLinkId(): bigint {
    return this.createGeneratedId();
  }

  private createGeneratedId(): bigint {
    const timestamp = Date.now().toString();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return BigInt(`${timestamp}${randomSuffix}`);
  }
}
