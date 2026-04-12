import { ApiProperty } from '@nestjs/swagger';

export class ShortenedUrlDto {
  @ApiProperty({ example: 'https://example.com/very/long/link' })
  public readonly originalUrl: string;

  @ApiProperty({ example: 'abc1234' })
  public readonly shortCode: string;

  @ApiProperty({ example: 'http://127.0.0.1:3000/v1/app/abc1234' })
  public readonly shortenedUrl: string;

  constructor(originalUrl: string, shortCode: string, shortenedUrl: string) {
    this.originalUrl = originalUrl;
    this.shortCode = shortCode;
    this.shortenedUrl = shortenedUrl;
  }
}
