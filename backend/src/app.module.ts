import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShortenUrlModule } from './shortenUrl/shorten-url.module';

@Module({
  imports: [ShortenUrlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
