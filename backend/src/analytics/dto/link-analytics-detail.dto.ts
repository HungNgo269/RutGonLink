import { ApiProperty } from '@nestjs/swagger';

export class LinkAnalyticsDetailDto {
  @ApiProperty({ example: 'abc1234' })
  public readonly shortCode: string;

  @ApiProperty({ example: 'https://example.com/very/long/link' })
  public readonly destinationUrl: string;

  @ApiProperty({ example: '/abc1234' })
  public readonly shortenedUrlPath: string;

  @ApiProperty({ example: '2026-04-12T08:00:00.000Z' })
  public readonly createdAt: string;

  @ApiProperty({ example: 42 })
  public readonly totalClicks: number;

  @ApiProperty({ type: () => [LinkAnalyticsTimePointDto] })
  public readonly engagementsOverTime: LinkAnalyticsTimePointDto[];

  @ApiProperty({ type: () => [LinkAnalyticsBreakdownDto] })
  public readonly locations: LinkAnalyticsBreakdownDto[];

  @ApiProperty({ type: () => [LinkAnalyticsBreakdownDto] })
  public readonly referrers: LinkAnalyticsBreakdownDto[];

  @ApiProperty({ type: () => [LinkAnalyticsBreakdownDto] })
  public readonly devices: LinkAnalyticsBreakdownDto[];

  constructor(
    shortCode: string,
    destinationUrl: string,
    shortenedUrlPath: string,
    createdAt: string,
    totalClicks: number,
    engagementsOverTime: LinkAnalyticsTimePointDto[],
    locations: LinkAnalyticsBreakdownDto[],
    referrers: LinkAnalyticsBreakdownDto[],
    devices: LinkAnalyticsBreakdownDto[],
  ) {
    this.shortCode = shortCode;
    this.destinationUrl = destinationUrl;
    this.shortenedUrlPath = shortenedUrlPath;
    this.createdAt = createdAt;
    this.totalClicks = totalClicks;
    this.engagementsOverTime = engagementsOverTime;
    this.locations = locations;
    this.referrers = referrers;
    this.devices = devices;
  }
}

export class LinkAnalyticsTimePointDto {
  @ApiProperty({ example: '2026-04-12' })
  public readonly date: string;

  @ApiProperty({ example: 12 })
  public readonly totalClicks: number;

  constructor(date: string, totalClicks: number) {
    this.date = date;
    this.totalClicks = totalClicks;
  }
}

export class LinkAnalyticsBreakdownDto {
  @ApiProperty({ example: 'Vietnam' })
  public readonly label: string;

  @ApiProperty({ example: 12 })
  public readonly totalClicks: number;

  @ApiProperty({ example: 30 })
  public readonly percentage: number;

  constructor(label: string, totalClicks: number, percentage: number) {
    this.label = label;
    this.totalClicks = totalClicks;
    this.percentage = percentage;
  }
}
