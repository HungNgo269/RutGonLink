import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BaseUrl } from './decorators/base-url.decorator';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { ShortenedUrlDto } from './dto/shortened-url.dto';
import { ShortenUrlService } from './shorten-url.service';

@Controller()
export class ShortenUrlController {
  constructor(private readonly shortenUrlService: ShortenUrlService) {}

  @Post('shorten-url')
  async create(
    @Body() request: CreateShortenUrlDto,
    @BaseUrl() baseUrl: string,
  ): Promise<ShortenedUrlDto> {
    return this.shortenUrlService.shorten(request, baseUrl);
  }

  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() response: Response,
  ): Promise<void> {
    const destinationUrl =
      await this.shortenUrlService.getDestinationUrl(shortCode);

    response.redirect(302, destinationUrl);
  }
}
