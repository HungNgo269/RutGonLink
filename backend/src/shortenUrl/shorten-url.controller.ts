import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthSessionService } from '../auth/auth-session.service';
import { TrackingService } from '../tracking/tracking.service';
import { BaseUrl } from './decorators/base-url.decorator';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { ShortenedUrlDto } from './dto/shortened-url.dto';
import { ShortenUrlService } from './shorten-url.service';

@Controller()
export class ShortenUrlController {
  constructor(
    private readonly shortenUrlService: ShortenUrlService,
    private readonly authSessionService: AuthSessionService,
    private readonly trackingService: TrackingService,
  ) {}

  @Post('shorten-url')
  async create(
    @Body() request: CreateShortenUrlDto,
    @BaseUrl() baseUrl: string,
    @Req() httpRequest: Request,
  ): Promise<ShortenedUrlDto> {
    const authenticatedUserId =
      await this.authSessionService.getAuthenticatedUserId(
        httpRequest.headers.cookie,
      );

    return this.shortenUrlService.shorten(
      request,
      baseUrl,
      authenticatedUserId,
    );
  }

  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Req() httpRequest: Request,
    @Res() response: Response,
  ): Promise<void> {
    const shortenedLink =
      await this.shortenUrlService.getRedirectTarget(shortCode);

    await this.trackingService.trackRedirectClick(shortenedLink, {
      referrerUrl:
        httpRequest.get('referer') ?? httpRequest.get('referrer') ?? null,
      ipAddress: httpRequest.ip ?? null,
      userAgent: httpRequest.headers['user-agent'] ?? null,
    });

    response.redirect(302, shortenedLink.destinationUrl);
  }
}
