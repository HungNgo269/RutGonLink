export class ShortenedUrlDto {
  constructor(
    public readonly originalUrl: string,
    public readonly shortCode: string,
    public readonly shortenedUrl: string,
  ) {}
}
