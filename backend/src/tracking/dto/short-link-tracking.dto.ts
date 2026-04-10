import { DeviceType } from '@prisma/client';

export class ShortLinkTrackingClickDto {
  constructor(
    public readonly clickedAt: string,
    public readonly referrerDomain: string | null,
    public readonly browser: string | null,
    public readonly os: string | null,
    public readonly deviceType: DeviceType | null,
    public readonly ipAddress: string | null,
  ) {}
}

export class ShortLinkTrackingDto {
  constructor(
    public readonly shortCode: string,
    public readonly destinationUrl: string,
    public readonly totalClicks: number,
    public readonly recentClicks: ShortLinkTrackingClickDto[],
  ) {}
}
