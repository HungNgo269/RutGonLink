import { AuthenticatedUserDto } from './authenticated-user.dto';

export class AuthResultDto {
  constructor(public readonly user: AuthenticatedUserDto) {}
}
