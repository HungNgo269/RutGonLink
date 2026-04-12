import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthCookieService } from '../auth-cookie.service';
import { AuthSessionService } from '../auth-session.service';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly authSessionService: AuthSessionService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<AuthenticatedRequest>();

    const authentication =
      await this.authSessionService.getAuthenticationResult(
        request.headers.cookie,
      );

    if (!authentication) {
      throw new UnauthorizedException('Authentication is required.');
    }

    request.userId = authentication.userId;

    if (authentication.refreshedAccessToken) {
      const response = httpContext.getResponse<Response>();
      this.authCookieService.setAccessCookie(
        response,
        authentication.refreshedAccessToken.token,
        authentication.refreshedAccessToken.maxAgeMs,
      );
    }

    return true;
  }
}
