import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ShortLinkTrackingClickDto,
  ShortLinkTrackingDto,
} from './dto/short-link-tracking.dto';

@Injectable()
export class TrackingService {
  constructor(private readonly prismaService: PrismaService) {}

  async trackRedirectClick(
    shortenedLink: RedirectTrackingLink,
    clickRequest: ClickTrackingRequest | null,
  ): Promise<void> {
    if (!shortenedLink.userId) {
      return;
    }

    const utmParameters = this.extractUtmParameters(
      clickRequest?.requestUrl ?? null,
      shortenedLink.destinationUrl,
    );

    await this.prismaService.clickEvent.create({
      data: {
        id: this.createClickEventId(),
        linkId: shortenedLink.id,
        userId: shortenedLink.userId,
        organizationId: shortenedLink.organizationId,
        referrerUrl: this.normalizeReferrerUrl(
          clickRequest?.referrerUrl ?? null,
        ),
        referrerDomain: this.extractReferrerDomain(
          clickRequest?.referrerUrl ?? null,
        ),
        utmSource: utmParameters.utmSource,
        utmMedium: utmParameters.utmMedium,
        utmCampaign: utmParameters.utmCampaign,
        utmTerm: utmParameters.utmTerm,
        utmContent: utmParameters.utmContent,
        country: this.normalizeLocationValue(clickRequest?.country ?? null),
        city: this.normalizeLocationValue(clickRequest?.city ?? null),
        deviceType: this.detectDeviceType(clickRequest?.userAgent ?? null),
        browser: this.detectBrowser(clickRequest?.userAgent ?? null),
        os: this.detectOperatingSystem(clickRequest?.userAgent ?? null),
        ipAddress: this.resolveClientIpAddress(clickRequest),
      },
    });
  }

  async getTracking(
    shortCode: string,
    authenticatedUserId: bigint,
  ): Promise<ShortLinkTrackingDto> {
    const shortenedLink = await this.prismaService.shortenedLink.findUnique({
      where: { shortCode },
      select: {
        id: true,
        userId: true,
        destinationUrl: true,
      },
    });

    if (!shortenedLink || shortenedLink.userId !== authenticatedUserId) {
      throw new NotFoundException('Short link not found.');
    }

    const clickWhere = {
      linkId: shortenedLink.id,
      userId: authenticatedUserId,
    };
    const [totalClicks, recentClicks] = await Promise.all([
      this.prismaService.clickEvent.count({ where: clickWhere }),
      this.prismaService.clickEvent.findMany({
        where: clickWhere,
        orderBy: { clickedAt: 'desc' },
        take: 20,
        select: {
          clickedAt: true,
          referrerDomain: true,
          browser: true,
          os: true,
          deviceType: true,
          ipAddress: true,
        },
      }),
    ]);

    return new ShortLinkTrackingDto(
      shortCode,
      shortenedLink.destinationUrl,
      totalClicks,
      recentClicks.map(
        (click) =>
          new ShortLinkTrackingClickDto(
            click.clickedAt.toISOString(),
            click.referrerDomain,
            click.browser,
            click.os,
            click.deviceType,
            click.ipAddress,
          ),
      ),
    );
  }

  private createClickEventId(): bigint {
    const timestamp = Date.now().toString();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return BigInt(`${timestamp}${randomSuffix}`);
  }

  private normalizeReferrerUrl(referrerUrl: string | null): string | null {
    if (!referrerUrl) {
      return null;
    }

    try {
      return new URL(referrerUrl).toString();
    } catch {
      return null;
    }
  }

  private extractReferrerDomain(referrerUrl: string | null): string | null {
    if (!referrerUrl) {
      return null;
    }

    try {
      return new URL(referrerUrl).hostname;
    } catch {
      return null;
    }
  }

  private extractUtmParameters(
    requestUrl: string | null,
    destinationUrl: string,
  ): UtmParameters {
    const request = this.parseUrl(requestUrl, 'http://short.local');
    const destination = this.parseUrl(destinationUrl);

    return {
      utmSource: this.getSearchParam(request, destination, 'utm_source', 100),
      utmMedium: this.getSearchParam(request, destination, 'utm_medium', 100),
      utmCampaign: this.getSearchParam(
        request,
        destination,
        'utm_campaign',
        150,
      ),
      utmTerm: this.getSearchParam(request, destination, 'utm_term', 150),
      utmContent: this.getSearchParam(request, destination, 'utm_content', 150),
    };
  }

  private getSearchParam(
    request: URL | null,
    destination: URL | null,
    name: string,
    maxLength: number,
  ): string | null {
    return (
      this.normalizeLimitedValue(
        request?.searchParams.get(name) ?? null,
        maxLength,
      ) ??
      this.normalizeLimitedValue(
        destination?.searchParams.get(name) ?? null,
        maxLength,
      )
    );
  }

  private parseUrl(url: string | null, baseUrl?: string): URL | null {
    if (!url) {
      return null;
    }

    try {
      return new URL(url, baseUrl);
    } catch {
      return null;
    }
  }

  private resolveClientIpAddress(
    clickRequest: ClickTrackingRequest | null,
  ): string | null {
    return this.normalizeIpAddress(
      this.getFirstForwardedIp(clickRequest?.forwardedFor ?? null) ??
        clickRequest?.realIp ??
        clickRequest?.ipAddress ??
        null,
    );
  }

  private getFirstForwardedIp(forwardedFor: string | null): string | null {
    return (
      forwardedFor
        ?.split(',')
        .map((ipAddress) => ipAddress.trim())
        .find(Boolean) ?? null
    );
  }

  private normalizeIpAddress(ipAddress: string | null): string | null {
    const normalizedIpAddress = ipAddress?.trim().replace(/^::ffff:/i, '');

    return this.normalizeLimitedValue(normalizedIpAddress ?? null, 45);
  }

  private normalizeLocationValue(value: string | null): string | null {
    const decodedValue = this.decodeHeaderValue(value);

    return this.normalizeLimitedValue(decodedValue, 100);
  }

  private decodeHeaderValue(value: string | null): string | null {
    if (!value) {
      return null;
    }

    try {
      return decodeURIComponent(value.replace(/\+/g, ' '));
    } catch {
      return value;
    }
  }

  private normalizeLimitedValue(
    value: string | null,
    maxLength: number,
  ): string | null {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      return null;
    }

    return normalizedValue.slice(0, maxLength);
  }

  private detectDeviceType(userAgent: string | null): DeviceType {
    const normalizedUserAgent = userAgent?.toLowerCase() ?? '';

    if (!normalizedUserAgent) {
      return DeviceType.other;
    }

    if (/bot|crawler|spider|slurp/.test(normalizedUserAgent)) {
      return DeviceType.bot;
    }

    if (/tablet|ipad/.test(normalizedUserAgent)) {
      return DeviceType.tablet;
    }

    if (/mobi|android|iphone/.test(normalizedUserAgent)) {
      return DeviceType.mobile;
    }

    return DeviceType.desktop;
  }

  private detectBrowser(userAgent: string | null): string | null {
    const normalizedUserAgent = userAgent?.toLowerCase() ?? '';

    if (!normalizedUserAgent) {
      return null;
    }

    if (normalizedUserAgent.includes('edg/')) {
      return 'Edge';
    }

    if (normalizedUserAgent.includes('chrome/')) {
      return 'Chrome';
    }

    if (normalizedUserAgent.includes('firefox/')) {
      return 'Firefox';
    }

    if (
      normalizedUserAgent.includes('safari/') &&
      !normalizedUserAgent.includes('chrome/')
    ) {
      return 'Safari';
    }

    return 'Other';
  }

  private detectOperatingSystem(userAgent: string | null): string | null {
    const normalizedUserAgent = userAgent?.toLowerCase() ?? '';

    if (!normalizedUserAgent) {
      return null;
    }

    if (normalizedUserAgent.includes('windows')) {
      return 'Windows';
    }

    if (normalizedUserAgent.includes('android')) {
      return 'Android';
    }

    if (/iphone|ipad|ios/.test(normalizedUserAgent)) {
      return 'iOS';
    }

    if (
      normalizedUserAgent.includes('mac os') ||
      normalizedUserAgent.includes('macintosh')
    ) {
      return 'macOS';
    }

    if (normalizedUserAgent.includes('linux')) {
      return 'Linux';
    }

    return 'Other';
  }
}

export type ClickTrackingRequest = {
  referrerUrl: string | null;
  ipAddress: string | null;
  forwardedFor: string | null;
  realIp: string | null;
  requestUrl: string | null;
  country: string | null;
  city: string | null;
  userAgent: string | null;
};

export type RedirectTrackingLink = {
  id: bigint;
  userId: bigint | null;
  organizationId: bigint | null;
  destinationUrl: string;
};

type UtmParameters = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
};
