import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  LinkAnalyticsBreakdownDto,
  LinkAnalyticsDetailDto,
  LinkAnalyticsTimePointDto,
} from './dto/link-analytics-detail.dto';
import {
  UserLinkAnalyticsDto,
  UserLinkAnalyticsItemDto,
} from './dto/user-link-analytics.dto';
import { DeleteShortenedLinkDto } from './dto/delete-shortened-link.dto';

const REDIS_REDIRECT_PREFIX = 'redirect:';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getUserLinkAnalytics(
    authenticatedUserId: bigint,
    query: LinkAnalyticsQuery = { page: 1, limit: 10 },
  ): Promise<UserLinkAnalyticsDto> {
    const page = Math.max(1, query.page);
    const limit = Math.min(Math.max(1, query.limit), 100);
    const where = this.buildUserLinkWhere(authenticatedUserId, query);
    const clickWhere = {
      userId: authenticatedUserId,
    };
    const [totalLinks, totalClicks, shortenedLinks] = await Promise.all([
      this.prismaService.shortenedLink.count({ where }),
      this.prismaService.clickEvent.count({ where: clickWhere }),
      this.prismaService.shortenedLink.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          shortCode: true,
          destinationUrl: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalLinks / limit);

    if (shortenedLinks.length === 0) {
      return new UserLinkAnalyticsDto(
        [],
        totalLinks,
        totalClicks,
        page,
        limit,
        totalPages,
      );
    }

    const clickAggregates = await this.prismaService.clickEvent.groupBy({
      by: ['linkId'],
      where: {
        userId: authenticatedUserId,
        linkId: {
          in: shortenedLinks.map((link) => link.id),
        },
      },
      _count: { _all: true },
      _max: { clickedAt: true },
    });

    const clickAggregateMap = new Map(
      clickAggregates.map((aggregate) => [
        aggregate.linkId.toString(),
        {
          totalClicks: aggregate._count._all,
          lastClickedAt: aggregate._max.clickedAt,
        },
      ]),
    );

    const analyticsItems = shortenedLinks.map((link) => {
      const clickAggregate = clickAggregateMap.get(link.id.toString());

      return new UserLinkAnalyticsItemDto(
        link.shortCode,
        link.destinationUrl,
        `/${link.shortCode}`,
        link.createdAt.toISOString(),
        link.expiresAt?.toISOString() ?? null,
        clickAggregate?.totalClicks ?? 0,
        clickAggregate?.lastClickedAt?.toISOString() ?? null,
      );
    });

    return new UserLinkAnalyticsDto(
      analyticsItems,
      totalLinks,
      totalClicks,
      page,
      limit,
      totalPages,
    );
  }

  async deleteUserShortenedLink(
    shortCode: string,
    authenticatedUserId: bigint,
  ): Promise<DeleteShortenedLinkDto> {
    const shortenedLink = await this.prismaService.shortenedLink.findUnique({
      where: { shortCode },
      select: {
        shortCode: true,
        userId: true,
      },
    });

    if (!shortenedLink || shortenedLink.userId !== authenticatedUserId) {
      throw new NotFoundException('Short link not found.');
    }

    await this.prismaService.shortenedLink.delete({
      where: { shortCode },
    });
    await this.redisService.del(`${REDIS_REDIRECT_PREFIX}${shortCode}`);

    return new DeleteShortenedLinkDto(shortenedLink.shortCode, true);
  }

  async getLinkAnalyticsDetail(
    shortCode: string,
    authenticatedUserId: bigint,
  ): Promise<LinkAnalyticsDetailDto> {
    const shortenedLink = await this.prismaService.shortenedLink.findUnique({
      where: { shortCode },
      select: {
        id: true,
        userId: true,
        shortCode: true,
        destinationUrl: true,
        createdAt: true,
      },
    });

    if (!shortenedLink || shortenedLink.userId !== authenticatedUserId) {
      throw new NotFoundException('Short link not found.');
    }

    const totalClicks = await this.prismaService.clickEvent.count({
      where: {
        linkId: shortenedLink.id,
        userId: authenticatedUserId,
      },
    });
    const [engagementsOverTime, locations, referrers, devices] =
      await Promise.all([
        this.getEngagementsOverTime(shortenedLink.id, authenticatedUserId),
        this.getLocations(shortenedLink.id, authenticatedUserId, totalClicks),
        this.getReferrers(shortenedLink.id, authenticatedUserId, totalClicks),
        this.getDevices(shortenedLink.id, authenticatedUserId, totalClicks),
      ]);

    return new LinkAnalyticsDetailDto(
      shortenedLink.shortCode,
      shortenedLink.destinationUrl,
      `/${shortenedLink.shortCode}`,
      shortenedLink.createdAt.toISOString(),
      totalClicks,
      engagementsOverTime,
      locations,
      referrers,
      devices,
    );
  }

  private async getEngagementsOverTime(
    linkId: bigint,
    authenticatedUserId: bigint,
  ): Promise<LinkAnalyticsTimePointDto[]> {
    const endDate = this.getUtcDateStart(new Date());
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - 13);

    const rows = await this.prismaService.$queryRaw<TimePointRow[]>(
      Prisma.sql`
        SELECT
          DATE(clicked_at)::text AS date,
          COUNT(*)::int AS "totalClicks"
        FROM click_events
        WHERE link_id = ${linkId}
          AND user_id = ${authenticatedUserId}
          AND clicked_at >= ${startDate}
        GROUP BY DATE(clicked_at)
        ORDER BY DATE(clicked_at) ASC
      `,
    );
    const clickCountByDate = new Map(
      rows.map((row) => [
        this.normalizeDateKey(row.date),
        Number(row.totalClicks),
      ]),
    );

    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + index);
      const dateKey = this.formatDateKey(date);

      return new LinkAnalyticsTimePointDto(
        dateKey,
        clickCountByDate.get(dateKey) ?? 0,
      );
    });
  }

  private async getLocations(
    linkId: bigint,
    authenticatedUserId: bigint,
    totalClicks: number,
  ): Promise<LinkAnalyticsBreakdownDto[]> {
    const rows = await this.prismaService.$queryRaw<BreakdownRow[]>(
      Prisma.sql`
        SELECT
          label,
          COUNT(*)::int AS "totalClicks"
        FROM (
          SELECT
            CASE
              WHEN NULLIF(TRIM(city), '') IS NOT NULL
                AND NULLIF(TRIM(country), '') IS NOT NULL
                THEN TRIM(city) || ', ' || TRIM(country)
              WHEN NULLIF(TRIM(city), '') IS NOT NULL THEN TRIM(city)
              WHEN NULLIF(TRIM(country), '') IS NOT NULL THEN TRIM(country)
              ELSE 'Unknown'
            END AS label
          FROM click_events
          WHERE link_id = ${linkId}
            AND user_id = ${authenticatedUserId}
        ) AS location_events
        GROUP BY label
        ORDER BY "totalClicks" DESC, label ASC
        LIMIT 5
      `,
    );

    return this.toBreakdownDtos(rows, totalClicks);
  }

  private async getReferrers(
    linkId: bigint,
    authenticatedUserId: bigint,
    totalClicks: number,
  ): Promise<LinkAnalyticsBreakdownDto[]> {
    const rows = await this.prismaService.$queryRaw<BreakdownRow[]>(
      Prisma.sql`
        SELECT
          label,
          COUNT(*)::int AS "totalClicks"
        FROM (
          SELECT
            COALESCE(NULLIF(TRIM(referrer_domain), ''), 'Direct / Unknown') AS label
          FROM click_events
          WHERE link_id = ${linkId}
            AND user_id = ${authenticatedUserId}
        ) AS referrer_events
        GROUP BY label
        ORDER BY "totalClicks" DESC, label ASC
        LIMIT 5
      `,
    );

    return this.toBreakdownDtos(rows, totalClicks);
  }

  private async getDevices(
    linkId: bigint,
    authenticatedUserId: bigint,
    totalClicks: number,
  ): Promise<LinkAnalyticsBreakdownDto[]> {
    const rows = await this.prismaService.$queryRaw<BreakdownRow[]>(
      Prisma.sql`
        SELECT
          label,
          COUNT(*)::int AS "totalClicks"
        FROM (
          SELECT
            CASE
              WHEN device_type IN ('mobile', 'tablet') THEN 'Mobiles'
              ELSE 'Laptop / PC'
            END AS label
          FROM click_events
          WHERE link_id = ${linkId}
            AND user_id = ${authenticatedUserId}
        ) AS device_events
        GROUP BY label
        ORDER BY "totalClicks" DESC, label ASC
        LIMIT 5
      `,
    );

    return this.toBreakdownDtos(rows, totalClicks);
  }

  private toBreakdownDtos(
    rows: BreakdownRow[],
    totalClicks: number,
  ): LinkAnalyticsBreakdownDto[] {
    if (totalClicks === 0) {
      return [];
    }

    return rows.map(
      (row) =>
        new LinkAnalyticsBreakdownDto(
          this.normalizeBreakdownLabel(row.label),
          Number(row.totalClicks),
          Math.round((Number(row.totalClicks) / totalClicks) * 1000) / 10,
        ),
    );
  }

  private getUtcDateStart(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private formatDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private normalizeDateKey(value: Date | string): string {
    if (value instanceof Date) {
      return this.formatDateKey(value);
    }

    return value.slice(0, 10);
  }

  private normalizeBreakdownLabel(label: string | null): string {
    return label?.trim() || 'Unknown';
  }

  private buildUserLinkWhere(
    authenticatedUserId: bigint,
    query: LinkAnalyticsQuery,
  ): Prisma.ShortenedLinkWhereInput {
    const search = query.search?.trim();
    const conditions: Prisma.ShortenedLinkWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { shortCode: { contains: search, mode: 'insensitive' } },
          { destinationUrl: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const expiryCondition = this.buildExpiryWhere(query.expires);

    if (expiryCondition) {
      conditions.push(expiryCondition);
    }

    return {
      userId: authenticatedUserId,
      ...(conditions.length > 0 ? { AND: conditions } : {}),
    };
  }

  private buildExpiryWhere(
    filter: LinkExpiryFilter | undefined,
  ): Prisma.ShortenedLinkWhereInput | null {
    const now = new Date();

    if (filter === 'expired') {
      return { expiresAt: { lte: now } };
    }

    if (filter === 'expiring') {
      return { expiresAt: { gt: now } };
    }

    if (filter === 'no-expiry') {
      return { expiresAt: null };
    }

    return null;
  }
}

export type LinkExpiryFilter = 'all' | 'expired' | 'expiring' | 'no-expiry';

export type LinkAnalyticsQuery = {
  page: number;
  limit: number;
  search?: string;
  expires?: LinkExpiryFilter;
};

type TimePointRow = {
  date: Date | string;
  totalClicks: number | bigint;
};

type BreakdownRow = {
  label: string | null;
  totalClicks: number | bigint;
};
