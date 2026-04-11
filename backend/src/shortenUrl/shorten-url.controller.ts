import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthCookieService } from '../auth/auth-cookie.service';
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
    private readonly authCookieService: AuthCookieService,
    private readonly trackingService: TrackingService,
  ) {}

  @Post('shorten-url')
  async create(
    @Body() request: CreateShortenUrlDto,
    @BaseUrl() baseUrl: string,
    @Req() httpRequest: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ShortenedUrlDto> {
    const authentication =
      await this.authSessionService.getAuthenticationResult(
        httpRequest.headers.cookie,
      );

    if (
      !authentication &&
      this.authCookieService.hasAuthCookie(httpRequest.headers.cookie)
    ) {
      throw new UnauthorizedException('Authentication is invalid.');
    }

    if (authentication?.refreshedAccessToken) {
      this.authCookieService.setAccessCookie(
        response,
        authentication.refreshedAccessToken.token,
        authentication.refreshedAccessToken.maxAgeMs,
      );
    }

    return this.shortenUrlService.shorten(
      request,
      baseUrl,
      authentication?.userId ?? null,
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
