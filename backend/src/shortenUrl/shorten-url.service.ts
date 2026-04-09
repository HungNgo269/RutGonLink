import { BadRequestException, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { ShortenedUrlDto } from './dto/shortened-url.dto';

@Injectable()
export class ShortenUrlService {
  shorten(request: CreateShortenUrlDto, baseUrl: string): ShortenedUrlDto {
    const originalUrl = this.parseUrl(request.url);
    const shortCode = nanoid(7);

    return new ShortenedUrlDto(
      originalUrl,
      shortCode,
      `${baseUrl}/${shortCode}`,
    );
  }

  private parseUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new BadRequestException('Invalid URL format.');
      }

      return parsedUrl.toString();
    } catch {
      throw new BadRequestException('Invalid URL format.');
    }
  }
}
