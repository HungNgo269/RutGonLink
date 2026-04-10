import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request.type';
import { ShortLinkTrackingDto } from './dto/short-link-tracking.dto';
import { TrackingService } from './tracking.service';

@Controller('shorten-url')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @UseGuards(AuthenticatedGuard)
  @Get(':shortCode/tracking')
  async getTracking(
    @Param('shortCode') shortCode: string,
    @Req() httpRequest: AuthenticatedRequest,
  ): Promise<ShortLinkTrackingDto> {
    return this.trackingService.getTracking(shortCode, httpRequest.userId);
  }
}
