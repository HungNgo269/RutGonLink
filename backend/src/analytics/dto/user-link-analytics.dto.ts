import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserLinkAnalyticsItemDto {
  @ApiProperty({ example: 'abc1234' })
  public readonly shortCode: string;

  @ApiProperty({ example: 'https://example.com/very/long/link' })
  public readonly destinationUrl: string;

  @ApiProperty({ example: '/abc1234' })
  public readonly shortenedUrlPath: string;

  @ApiProperty({ example: '2026-04-12T08:00:00.000Z' })
  public readonly createdAt: string;

  @ApiPropertyOptional({ example: '2026-05-12T08:00:00.000Z', nullable: true })
  public readonly expiresAt: string | null;

  @ApiProperty({ example: 42 })
  public readonly totalClicks: number;

  @ApiPropertyOptional({ example: '2026-04-12T09:00:00.000Z', nullable: true })
  public readonly lastClickedAt: string | null;

  constructor(
    shortCode: string,
    destinationUrl: string,
    shortenedUrlPath: string,
    createdAt: string,
    expiresAt: string | null,
    totalClicks: number,
    lastClickedAt: string | null,
  ) {
    this.shortCode = shortCode;
    this.destinationUrl = destinationUrl;
    this.shortenedUrlPath = shortenedUrlPath;
    this.createdAt = createdAt;
    this.expiresAt = expiresAt;
    this.totalClicks = totalClicks;
    this.lastClickedAt = lastClickedAt;
  }
}

export class UserLinkAnalyticsDto {
  @ApiProperty({ type: [UserLinkAnalyticsItemDto] })
  public readonly links: UserLinkAnalyticsItemDto[];

  @ApiProperty({ example: 12 })
  public readonly totalLinks: number;

  @ApiProperty({ example: 120 })
  public readonly totalClicks: number;

  @ApiProperty({ example: 1 })
  public readonly page: number;

  @ApiProperty({ example: 10 })
  public readonly limit: number;

  @ApiProperty({ example: 2 })
  public readonly totalPages: number;

  constructor(
    links: UserLinkAnalyticsItemDto[],
    totalLinks: number,
    totalClicks: number,
    page: number,
    limit: number,
    totalPages: number,
  ) {
    this.links = links;
    this.totalLinks = totalLinks;
    this.totalClicks = totalClicks;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages;
  }
}
