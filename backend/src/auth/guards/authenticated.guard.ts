import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AuthSessionService } from '../auth-session.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly authSessionService: AuthSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    await this.authSessionService.ensureAuthenticated(request.headers.cookie);

    return true;
  }
}
