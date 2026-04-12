import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedUserDto {
  @ApiProperty({ example: '1000000000001' })
  public readonly id: string;

  @ApiProperty({ example: 'you@company.com' })
  public readonly email: string;

  @ApiProperty({ example: 'Jane Cooper' })
  public readonly fullName: string;

  @ApiProperty({ example: 'free' })
  public readonly tier: string;

  constructor(id: string, email: string, fullName: string, tier: string) {
    this.id = id;
    this.email = email;
    this.fullName = fullName;
    this.tier = tier;
  }
}
