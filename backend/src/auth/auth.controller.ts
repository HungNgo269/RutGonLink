import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthCookieService } from './auth-cookie.service';
import { AuthService } from './auth.service';
import { AuthResultDto } from './dto/auth-result.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { GuestOnlyGuard } from './guards/guest-only.guard';
import type { AuthenticatedRequest } from './types/authenticated-request.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @UseGuards(GuestOnlyGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(
    @Body() request: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResultDto> {
    const result = await this.authService.register(request);

    this.authCookieService.setAuthCookies(
      response,
      result.accessToken,
      result.accessTokenMaxAgeMs,
      result.refreshToken,
      result.refreshTokenMaxAgeMs,
    );

    return new AuthResultDto(result.user);
  }

  @UseGuards(GuestOnlyGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() request: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResultDto> {
    const result = await this.authService.login(request);

    this.authCookieService.setAuthCookies(
      response,
      result.accessToken,
      result.accessTokenMaxAgeMs,
      result.refreshToken,
      result.refreshTokenMaxAgeMs,
    );

    return new AuthResultDto(result.user);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async me(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResultDto> {
    const result = await this.authService.getCurrentUser(request.userId);

    if (request.authSessionSource === 'refresh') {
      const accessToken = this.authService.issueAccessToken(result.user);

      this.authCookieService.setAccessCookie(
        response,
        accessToken.accessToken,
        accessToken.accessTokenMaxAgeMs,
      );
    }

    return result;
  }

  @UseGuards(AuthenticatedGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    await this.authService.logout(request.headers.cookie);
    this.authCookieService.clearAuthCookies(response);

    return { success: true };
  }
}
