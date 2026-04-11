import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
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
  ): Promise<UserLinkAnalyticsDto> {
    return this.analyticsService.getUserLinkAnalytics(httpRequest.userId);
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
}
