import { ApiProperty } from '@nestjs/swagger';
import { AuthenticatedUserDto } from './authenticated-user.dto';

export class AuthResultDto {
  @ApiProperty({ type: AuthenticatedUserDto })
  public readonly user: AuthenticatedUserDto;

  constructor(user: AuthenticatedUserDto) {
    this.user = user;
  }
}
