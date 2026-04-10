import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { ShortenedUrlDto } from './dto/shortened-url.dto';

@Injectable()
export class ShortenUrlService {
  constructor(private readonly prismaService: PrismaService) {}

  async shorten(
    request: CreateShortenUrlDto,
    baseUrl: string,
  ): Promise<ShortenedUrlDto> {
    const originalUrl = this.parseUrl(request.url);
    const shortCode = await this.createUniqueShortCode();

    await this.prismaService.shortenedLink.create({
      data: {
        id: this.createShortenedLinkId(),
        shortCode,
        destinationUrl: originalUrl,
      },
    });

    return new ShortenedUrlDto(
      originalUrl,
      shortCode,
      `${baseUrl}/${shortCode}`,
    );
  }

  async getDestinationUrl(shortCode: string): Promise<string> {
    const shortenedLink = await this.prismaService.shortenedLink.findUnique({
      where: { shortCode },
      select: {
        destinationUrl: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (
      !shortenedLink ||
      !shortenedLink.isActive ||
      (shortenedLink.expiresAt &&
        shortenedLink.expiresAt.getTime() <= Date.now())
    ) {
      throw new NotFoundException('Short link not found.');
    }

    return shortenedLink.destinationUrl;
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

  private async createUniqueShortCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const shortCode = nanoid(7);
      const existingLink = await this.prismaService.shortenedLink.findUnique({
        where: { shortCode },
        select: { id: true },
      });

      if (!existingLink) {
        return shortCode;
      }
    }

    throw new BadRequestException(
      'Unable to create a unique short link. Please try again.',
    );
  }

  private createShortenedLinkId(): bigint {
    const timestamp = Date.now().toString();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return BigInt(`${timestamp}${randomSuffix}`);
  }
}
