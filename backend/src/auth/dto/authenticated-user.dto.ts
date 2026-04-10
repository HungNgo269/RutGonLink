export class AuthenticatedUserDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly tier: string,
  ) {}
}
