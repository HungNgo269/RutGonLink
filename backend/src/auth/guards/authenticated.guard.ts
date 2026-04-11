import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthSessionService } from '../auth-session.service';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly authSessionService: AuthSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const session = await this.authSessionService.getAuthenticatedSession(
      request.headers.cookie,
    );

    if (!session) {
      await this.authSessionService.ensureAuthenticated(request.headers.cookie);
      return true;
    }

    request.authSessionSource = session.source;
    request.userId = session.userId;

    return true;
  }
}
