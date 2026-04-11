import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCookieService } from './auth-cookie.service';
import { AuthTokenService } from './auth-token.service';
import { PasswordHashService } from './password-hash.service';

export type AuthenticationResult = {
  userId: bigint;
  refreshedAccessToken: {
    token: string;
    maxAgeMs: number;
  } | null;
};

type VerifiedRefreshToken = {
  userId: bigint;
  email: string;
  tier: string;
};

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authCookieService: AuthCookieService,
    private readonly authTokenService: AuthTokenService,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async ensureGuest(cookieHeader: string | undefined): Promise<void> {
    if ((await this.getAuthenticationResult(cookieHeader)) !== null) {
      throw new ForbiddenException('You are already authenticated.');
    }
  }

  async ensureAuthenticated(cookieHeader: string | undefined): Promise<void> {
    if ((await this.getAuthenticationResult(cookieHeader)) !== null) {
      return;
    }

    throw new UnauthorizedException('Authentication is required.');
  }

  async getAuthenticatedUserId(
    cookieHeader: string | undefined,
  ): Promise<bigint | null> {
    const authentication = await this.getAuthenticationResult(cookieHeader);

    return authentication?.userId ?? null;
  }

  async getAuthenticationResult(
    cookieHeader: string | undefined,
  ): Promise<AuthenticationResult | null> {
    const accessToken = this.authCookieService.readAccessToken(cookieHeader);

    if (accessToken) {
      try {
        const payload = this.authTokenService.verifyAccessToken(accessToken);
        return {
          userId: BigInt(payload.sub),
          refreshedAccessToken: null,
        };
      } catch {
        // Fall through to refresh token validation.
      }
    }

    const refreshToken = await this.validateStoredRefreshToken(cookieHeader);

    if (!refreshToken) {
      return null;
    }

    const refreshedAccessToken = this.authTokenService.createAccessToken({
      sub: refreshToken.userId.toString(),
      email: refreshToken.email,
      tier: refreshToken.tier,
    });

    return {
      userId: refreshToken.userId,
      refreshedAccessToken: {
        token: refreshedAccessToken.token,
        maxAgeMs: refreshedAccessToken.expiresInSeconds * 1000,
      },
    };
  }

  async validateStoredRefreshToken(
    cookieHeader: string | undefined,
  ): Promise<VerifiedRefreshToken | null> {
    const refreshToken = this.authCookieService.readRefreshToken(cookieHeader);

    if (!refreshToken) {
      return null;
    }

    try {
      const payload = this.authTokenService.verifyRefreshToken(refreshToken);
      const userId = BigInt(payload.sub);
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          refreshTokenHash: true,
          tier: true,
          isActive: true,
        },
      });

      if (
        !user?.isActive ||
        !user.refreshTokenHash ||
        !this.passwordHashService.matches(refreshToken, user.refreshTokenHash)
      ) {
        return null;
      }

      return {
        userId,
        email: user.email,
        tier: user.tier,
      };
    } catch {
      return null;
    }
  }
}
