import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.type';
import { AnalyticsService, type LinkExpiryFilter } from './analytics.service';
import { DeleteShortenedLinkDto } from './dto/delete-shortened-link.dto';
import { LinkAnalyticsDetailDto } from './dto/link-analytics-detail.dto';
import { UserLinkAnalyticsDto } from './dto/user-link-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('links')
  async getUserLinkAnalytics(
    @Req() httpRequest: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('expires') expires?: string,
  ): Promise<UserLinkAnalyticsDto> {
    return this.analyticsService.getUserLinkAnalytics(httpRequest.userId, {
      page: this.parsePositiveInteger(page, 1),
      limit: this.parsePositiveInteger(limit, 10),
      search: this.parseSearch(search),
      expires: this.parseExpiryFilter(expires),
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Get('links/:shortCode')
  async getLinkAnalyticsDetail(
    @Param('shortCode') shortCode: string,
    @Req() httpRequest: AuthenticatedRequest,
  ): Promise<LinkAnalyticsDetailDto> {
    return this.analyticsService.getLinkAnalyticsDetail(
      shortCode,
      httpRequest.userId,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('links/:shortCode')
  async deleteShortenedLink(
    @Param('shortCode') shortCode: string,
    @Req() httpRequest: AuthenticatedRequest,
  ): Promise<DeleteShortenedLinkDto> {
    return this.analyticsService.deleteUserShortenedLink(
      shortCode,
      httpRequest.userId,
    );
  }

  private parsePositiveInteger(value: string | undefined, fallback: number) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      return fallback;
    }

    return parsedValue;
  }

  private parseSearch(value: string | undefined): string | undefined {
    const trimmedValue = value?.trim();

    return trimmedValue ? trimmedValue.slice(0, 200) : undefined;
  }

  private parseExpiryFilter(value: string | undefined): LinkExpiryFilter {
    if (value === 'expired' || value === 'expiring' || value === 'no-expiry') {
      return value;
    }

    return 'all';
  }
}
