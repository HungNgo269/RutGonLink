import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthTokenService } from './auth-token.service';
import { PasswordHashService } from './password-hash.service';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authCookieService: AuthCookieService,
    private readonly authTokenService: AuthTokenService,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async ensureGuest(cookieHeader: string | undefined): Promise<void> {
    if (await this.hasActiveSession(cookieHeader)) {
      throw new ForbiddenException('You are already authenticated.');
    }
  }

  async ensureAuthenticated(cookieHeader: string | undefined): Promise<void> {
    if (await this.hasActiveSession(cookieHeader)) {
      return;
    }

    throw new UnauthorizedException('Authentication is required.');
  }

  async validateStoredRefreshToken(
    cookieHeader: string | undefined,
  ): Promise<{ userId: bigint } | null> {
    const refreshToken = this.authCookieService.readRefreshToken(cookieHeader);

    if (!refreshToken) {
      return null;
    }

    try {
      const payload = this.authTokenService.verifyRefreshToken(refreshToken);
      const user = await this.prismaService.user.findUnique({
        where: { id: BigInt(payload.sub) },
        select: { refreshTokenHash: true },
      });

      if (
        !user?.refreshTokenHash ||
        !this.passwordHashService.matches(refreshToken, user.refreshTokenHash)
      ) {
        return null;
      }

      return { userId: BigInt(payload.sub) };
    } catch {
      return null;
    }
  }

  private async hasActiveSession(
    cookieHeader: string | undefined,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const accessToken = this.authCookieService.readAccessToken(cookieHeader);

    if (accessToken) {
      try {
        this.authTokenService.verifyAccessToken(accessToken);
        return true;
      } catch {
        // Fall through to refresh token validation.
      }
    }

    return (await this.validateStoredRefreshToken(cookieHeader)) !== null;
  }
}
