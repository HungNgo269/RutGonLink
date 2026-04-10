import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './auth-cookie.service';
import { AuthSessionService } from './auth-session.service';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { GuestOnlyGuard } from './guards/guest-only.guard';
import { PasswordHashService } from './password-hash.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookieService,
    AuthSessionService,
    AuthTokenService,
    AuthenticatedGuard,
    GuestOnlyGuard,
    PasswordHashService,
  ],
})
export class AuthModule {}
