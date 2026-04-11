import { DeviceType } from '@prisma/client';

export class LinkAnalyticsClickDetailDto {
  constructor(
    public readonly clickedAt: string,
    public readonly referrerUrl: string | null,
    public readonly referrerDomain: string | null,
    public readonly utmSource: string | null,
    public readonly utmMedium: string | null,
    public readonly utmCampaign: string | null,
    public readonly utmTerm: string | null,
    public readonly utmContent: string | null,
    public readonly country: string | null,
    public readonly city: string | null,
    public readonly deviceType: DeviceType | null,
    public readonly browser: string | null,
    public readonly os: string | null,
    public readonly ipAddress: string | null,
  ) {}
}

export class LinkAnalyticsDetailDto {
  constructor(
    public readonly shortCode: string,
    public readonly destinationUrl: string,
    public readonly shortenedUrlPath: string,
    public readonly createdAt: string,
    public readonly totalClicks: number,
    public readonly clicks: LinkAnalyticsClickDetailDto[],
  ) {}
}
