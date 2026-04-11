import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

@Injectable()
export class AuthCookieService {
  setAuthCookies(
    response: Response,
    accessToken: string,
    accessTokenMaxAgeMs: number,
    refreshToken: string,
    refreshTokenMaxAgeMs: number,
  ): void {
    response.cookie(this.accessCookieName, accessToken, {
      ...this.baseCookieOptions,
      maxAge: accessTokenMaxAgeMs,
    });
    response.cookie(this.refreshCookieName, refreshToken, {
      ...this.baseCookieOptions,
      maxAge: refreshTokenMaxAgeMs,
    });
  }

  setAccessCookie(
    response: Response,
    accessToken: string,
    accessTokenMaxAgeMs: number,
  ): void {
    response.cookie(this.accessCookieName, accessToken, {
      ...this.baseCookieOptions,
      maxAge: accessTokenMaxAgeMs,
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie(this.accessCookieName, this.baseCookieOptions);
    response.clearCookie(this.refreshCookieName, this.baseCookieOptions);
  }

  readAccessToken(cookieHeader: string | undefined): string | null {
    return this.readCookie(cookieHeader, this.accessCookieName);
  }

  readRefreshToken(cookieHeader: string | undefined): string | null {
    return this.readCookie(cookieHeader, this.refreshCookieName);
  }

  private readCookie(
    cookieHeader: string | undefined,
    cookieName: string,
  ): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';');

    for (const rawCookie of cookies) {
      const [name, ...rest] = rawCookie.trim().split('=');

      if (name === cookieName) {
        return decodeURIComponent(rest.join('='));
      }
    }

    return null;
  }

  private get baseCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }

  private get accessCookieName(): string {
    return process.env.JWT_ACCESS_COOKIE_NAME ?? 'access_token';
  }

  private get refreshCookieName(): string {
    return process.env.JWT_REFRESH_COOKIE_NAME ?? 'refresh_token';
  }
}
