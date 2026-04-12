import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.type';
import { AnalyticsService } from './analytics.service';
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
  ): Promise<UserLinkAnalyticsDto> {
    return this.analyticsService.getUserLinkAnalytics(httpRequest.userId, {
      page: this.parsePositiveInteger(page, 1),
      limit: this.parsePositiveInteger(limit, 10),
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

  private parsePositiveInteger(value: string | undefined, fallback: number) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      return fallback;
    }

    return parsedValue;
  }
}
