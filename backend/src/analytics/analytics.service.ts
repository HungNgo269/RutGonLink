import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LinkAnalyticsClickDetailDto,
  LinkAnalyticsDetailDto,
} from './dto/link-analytics-detail.dto';
import {
  UserLinkAnalyticsDto,
  UserLinkAnalyticsItemDto,
} from './dto/user-link-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserLinkAnalytics(
    authenticatedUserId: bigint,
  ): Promise<UserLinkAnalyticsDto> {
    const shortenedLinks = await this.prismaService.shortenedLink.findMany({
      where: {
        userId: authenticatedUserId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shortCode: true,
        destinationUrl: true,
        createdAt: true,
      },
    });

    if (shortenedLinks.length === 0) {
      return new UserLinkAnalyticsDto([], 0, 0);
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
        clickAggregate?.totalClicks ?? 0,
        clickAggregate?.lastClickedAt?.toISOString() ?? null,
      );
    });

    return new UserLinkAnalyticsDto(
      analyticsItems,
      analyticsItems.length,
      analyticsItems.reduce((sum, item) => sum + item.totalClicks, 0),
    );
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

    const clickWhere = {
      linkId: shortenedLink.id,
      userId: authenticatedUserId,
    };
    const [totalClicks, clicks] = await Promise.all([
      this.prismaService.clickEvent.count({ where: clickWhere }),
      this.prismaService.clickEvent.findMany({
        where: clickWhere,
        orderBy: { clickedAt: 'desc' },
        select: {
          clickedAt: true,
          referrerUrl: true,
          referrerDomain: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmTerm: true,
          utmContent: true,
          country: true,
          city: true,
          deviceType: true,
          browser: true,
          os: true,
          ipAddress: true,
        },
      }),
    ]);

    return new LinkAnalyticsDetailDto(
      shortenedLink.shortCode,
      shortenedLink.destinationUrl,
      `/${shortenedLink.shortCode}`,
      shortenedLink.createdAt.toISOString(),
      totalClicks,
      clicks.map(
        (click) =>
          new LinkAnalyticsClickDetailDto(
            click.clickedAt.toISOString(),
            click.referrerUrl,
            click.referrerDomain,
            click.utmSource,
            click.utmMedium,
            click.utmCampaign,
            click.utmTerm,
            click.utmContent,
            click.country,
            click.city,
            click.deviceType,
            click.browser,
            click.os,
            click.ipAddress,
          ),
      ),
    );
  }
}
