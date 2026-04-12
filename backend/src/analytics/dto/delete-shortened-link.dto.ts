import { ApiProperty } from '@nestjs/swagger';

export class DeleteShortenedLinkDto {
  @ApiProperty({ example: 'abc1234' })
  public readonly shortCode: string;

  @ApiProperty({ example: true })
  public readonly deleted: boolean;

  constructor(shortCode: string, deleted: boolean) {
    this.shortCode = shortCode;
    this.deleted = deleted;
  }
}
