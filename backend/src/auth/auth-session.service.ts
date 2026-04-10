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
    if ((await this.getAuthenticatedUserId(cookieHeader)) !== null) {
      throw new ForbiddenException('You are already authenticated.');
    }
  }

  async ensureAuthenticated(cookieHeader: string | undefined): Promise<void> {
    if ((await this.getAuthenticatedUserId(cookieHeader)) !== null) {
      return;
    }

    throw new UnauthorizedException('Authentication is required.');
  }

  async getAuthenticatedUserId(
    cookieHeader: string | undefined,
  ): Promise<bigint | null> {
    const accessToken = this.authCookieService.readAccessToken(cookieHeader);

    if (accessToken) {
      try {
        const payload = this.authTokenService.verifyAccessToken(accessToken);
        return BigInt(payload.sub);
      } catch {
        // Fall through to refresh token validation.
      }
    }

    const session = await this.validateStoredRefreshToken(cookieHeader);

    return session?.userId ?? null;
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
}
