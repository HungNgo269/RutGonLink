import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';

export class ShortLinkTrackingClickDto {
  @ApiProperty({ example: '2026-04-12T08:00:00.000Z' })
  public readonly clickedAt: string;

  @ApiPropertyOptional({ example: 'example.com', nullable: true })
  public readonly referrerDomain: string | null;

  @ApiPropertyOptional({ example: 'Chrome', nullable: true })
  public readonly browser: string | null;

  @ApiPropertyOptional({ example: 'Windows', nullable: true })
  public readonly os: string | null;

  @ApiPropertyOptional({ enum: DeviceType, nullable: true })
  public readonly deviceType: DeviceType | null;

  @ApiPropertyOptional({ example: '127.0.0.1', nullable: true })
  public readonly ipAddress: string | null;

  @ApiPropertyOptional({ example: 'Ho Chi Minh City', nullable: true })
  public readonly city: string | null;

  @ApiPropertyOptional({ example: 'VN', nullable: true })
  public readonly country: string | null;

  constructor(
    clickedAt: string,
    referrerDomain: string | null,
    browser: string | null,
    os: string | null,
    deviceType: DeviceType | null,
    ipAddress: string | null,
    city: string | null,
    country: string | null,
  ) {
    this.clickedAt = clickedAt;
    this.referrerDomain = referrerDomain;
    this.browser = browser;
    this.os = os;
    this.deviceType = deviceType;
    this.ipAddress = ipAddress;
    this.city = city;
    this.country = country;
  }
}

export class ShortLinkTrackingDto {
  @ApiProperty({ example: 'abc1234' })
  public readonly shortCode: string;

  @ApiProperty({ example: 'https://example.com/very/long/link' })
  public readonly destinationUrl: string;

  @ApiProperty({ example: 42 })
  public readonly totalClicks: number;

  @ApiProperty({ type: [ShortLinkTrackingClickDto] })
  public readonly recentClicks: ShortLinkTrackingClickDto[];

  constructor(
    shortCode: string,
    destinationUrl: string,
    totalClicks: number,
    recentClicks: ShortLinkTrackingClickDto[],
  ) {
    this.shortCode = shortCode;
    this.destinationUrl = destinationUrl;
    this.totalClicks = totalClicks;
    this.recentClicks = recentClicks;
  }
}
