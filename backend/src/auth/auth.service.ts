import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { AuthResultDto } from './dto/auth-result.dto';
import { AuthenticatedUserDto } from './dto/authenticated-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordHashService } from './password-hash.service';

type AuthUserRecord = {
  id: bigint;
  email: string;
  fullName: string;
  tier: UserTier;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordHashService: PasswordHashService,
    private readonly authTokenService: AuthTokenService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async register(
    request: RegisterDto,
  ): Promise<AuthResultDto & AuthTokensResult> {
    const normalizedEmail = this.normalizeEmail(request.email);
    const fullName = this.normalizeFullName(request.fullName);
    this.ensurePasswordIsValid(request.password);

    const existingUser = await this.prismaService.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use.');
    }

    const passwordHash = this.passwordHashService.hash(request.password);
    const userId = this.createUserId();
    const issuedTokens = this.issueTokens({
      id: userId.toString(),
      email: normalizedEmail,
      tier: UserTier.logged_in,
    });
    const refreshTokenHash = this.passwordHashService.hash(
      issuedTokens.refreshToken,
    );

    const createdUser = await this.prismaService.user.create({
      data: {
        id: userId,
        email: normalizedEmail,
        fullName,
        passwordHash,
        refreshTokenHash,
      },
      select: this.userSelection,
    });

    return {
      ...this.toAuthResult(createdUser),
      ...issuedTokens,
    };
  }

  async login(request: LoginDto): Promise<AuthResultDto & AuthTokensResult> {
    const normalizedEmail = this.normalizeEmail(request.email);
    this.ensurePasswordIsPresent(request.password);

    const user = await this.prismaService.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        ...this.userSelection,
        passwordHash: true,
        isActive: true,
      },
    });

    if (
      !user ||
      !user.isActive ||
      !this.passwordHashService.matches(request.password, user.passwordHash)
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const issuedTokens = this.issueTokens({
      id: user.id.toString(),
      email: user.email,
      tier: user.tier,
    });

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: this.passwordHashService.hash(
          issuedTokens.refreshToken,
        ),
      },
    });

    return {
      ...this.toAuthResult(user),
      ...issuedTokens,
    };
  }

  async getCurrentUser(userId: bigint): Promise<AuthResultDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: this.userSelection,
    });

    if (!user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return this.toAuthResult(user);
  }

  issueAccessToken(user: AuthenticatedUserDto): AuthAccessTokenResult {
    const accessToken = this.authTokenService.createAccessToken({
      sub: user.id,
      email: user.email,
      tier: user.tier,
    });

    return {
      accessToken: accessToken.token,
      accessTokenMaxAgeMs: accessToken.expiresInSeconds * 1000,
    };
  }

  async logout(cookieHeader: string | undefined): Promise<void> {
    const session =
      await this.authSessionService.validateStoredRefreshToken(cookieHeader);

    if (!session) {
      return;
    }

    await this.prismaService.user.update({
      where: { id: session.userId },
      data: { refreshTokenHash: null },
    });
  }

  private issueTokens(payload: {
    id: string;
    email: string;
    tier: string;
  }): AuthTokensResult {
    const accessToken = this.authTokenService.createAccessToken({
      sub: payload.id,
      email: payload.email,
      tier: payload.tier,
    });
    const refreshToken = this.authTokenService.createRefreshToken({
      sub: payload.id,
      email: payload.email,
      tier: payload.tier,
    });

    return {
      accessToken: accessToken.token,
      accessTokenMaxAgeMs: accessToken.expiresInSeconds * 1000,
      refreshToken: refreshToken.token,
      refreshTokenMaxAgeMs: refreshToken.expiresInSeconds * 1000,
    };
  }

  private toAuthResult(user: AuthUserRecord): AuthResultDto {
    return new AuthResultDto(
      new AuthenticatedUserDto(
        user.id.toString(),
        user.email,
        user.fullName,
        user.tier,
      ),
    );
  }

  private normalizeEmail(email: string): string {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      throw new BadRequestException('Email is invalid.');
    }

    return normalizedEmail;
  }

  private normalizeFullName(fullName: string): string {
    const normalizedFullName = fullName.trim();

    if (!normalizedFullName) {
      throw new BadRequestException('Full name is required.');
    }

    return normalizedFullName;
  }

  private ensurePasswordIsValid(password: string): void {
    this.ensurePasswordIsPresent(password);

    if (password.trim().length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long.',
      );
    }
  }

  private ensurePasswordIsPresent(password: string): void {
    if (!password || !password.trim()) {
      throw new BadRequestException('Password is required.');
    }
  }

  private createUserId(): bigint {
    const timestamp = Date.now().toString();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return BigInt(`${timestamp}${randomSuffix}`);
  }

  private get userSelection() {
    return {
      id: true,
      email: true,
      fullName: true,
      tier: true,
    } as const;
  }
}

type AuthTokensResult = {
  accessToken: string;
  accessTokenMaxAgeMs: number;
  refreshToken: string;
  refreshTokenMaxAgeMs: number;
};

type AuthAccessTokenResult = Pick<
  AuthTokensResult,
  'accessToken' | 'accessTokenMaxAgeMs'
>;
