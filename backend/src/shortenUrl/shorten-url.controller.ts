import { Body, Controller, Post } from '@nestjs/common';
import { BaseUrl } from './decorators/base-url.decorator';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { ShortenedUrlDto } from './dto/shortened-url.dto';
import { ShortenUrlService } from './shorten-url.service';

@Controller('shorten-url')
export class ShortenUrlController {
  constructor(private readonly shortenUrlService: ShortenUrlService) {}

  @Post()
  create(
    @Body() request: CreateShortenUrlDto,
    @BaseUrl() baseUrl: string,
  ): ShortenedUrlDto {
    return this.shortenUrlService.shorten(request, baseUrl);
  }
}
