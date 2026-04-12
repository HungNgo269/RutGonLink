export class UserLinkAnalyticsItemDto {
  constructor(
    public readonly shortCode: string,
    public readonly destinationUrl: string,
    public readonly shortenedUrlPath: string,
    public readonly createdAt: string,
    public readonly totalClicks: number,
    public readonly lastClickedAt: string | null,
  ) {}
}

export class UserLinkAnalyticsDto {
  constructor(
    public readonly links: UserLinkAnalyticsItemDto[],
    public readonly totalLinks: number,
    public readonly totalClicks: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly totalPages: number,
  ) {}
}
