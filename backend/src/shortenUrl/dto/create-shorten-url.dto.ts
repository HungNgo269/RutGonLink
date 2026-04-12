import { ApiProperty } from '@nestjs/swagger';

export class CreateShortenUrlDto {
  @ApiProperty({ example: 'https://example.com/very/long/link' })
  url!: string;
}
