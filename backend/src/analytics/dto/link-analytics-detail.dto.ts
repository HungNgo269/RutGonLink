export class LinkAnalyticsDetailDto {
  constructor(
    public readonly shortCode: string,
    public readonly destinationUrl: string,
    public readonly shortenedUrlPath: string,
    public readonly createdAt: string,
    public readonly totalClicks: number,
    public readonly engagementsOverTime: LinkAnalyticsTimePointDto[],
    public readonly locations: LinkAnalyticsBreakdownDto[],
    public readonly referrers: LinkAnalyticsBreakdownDto[],
    public readonly devices: LinkAnalyticsBreakdownDto[],
  ) {}
}

export class LinkAnalyticsTimePointDto {
  constructor(
    public readonly date: string,
    public readonly totalClicks: number,
  ) {}
}

export class LinkAnalyticsBreakdownDto {
  constructor(
    public readonly label: string,
    public readonly totalClicks: number,
    public readonly percentage: number,
  ) {}
}
