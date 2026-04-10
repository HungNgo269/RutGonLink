import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TrackingModule } from '../tracking/tracking.module';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';

@Module({
  imports: [AuthModule, TrackingModule],
  controllers: [ShortenUrlController],
  providers: [ShortenUrlService],
  exports: [ShortenUrlService],
})
export class ShortenUrlModule {}
