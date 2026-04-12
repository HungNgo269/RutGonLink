import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.type';
import { ShortLinkTrackingDto } from './dto/short-link-tracking.dto';
import { TrackingService } from './tracking.service';

@Controller('shorten-url')
@ApiTags('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Read recent tracking events for one owned link.' })
  @ApiOkResponse({ type: ShortLinkTrackingDto })
  @Get(':shortCode/tracking')
  async getTracking(
    @Param('shortCode') shortCode: string,
    @Req() httpRequest: AuthenticatedRequest,
  ): Promise<ShortLinkTrackingDto> {
    return this.trackingService.getTracking(shortCode, httpRequest.userId);
  }
}
