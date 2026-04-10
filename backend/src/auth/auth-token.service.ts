import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AuthTokenPayload, TokenKind } from './types/auth.types';

type SignedTokenPair = {
  token: string;
  expiresInSeconds: number;
};

@Injectable()
export class AuthTokenService {
  createAccessToken(payload: Omit<AuthTokenPayload, 'type'>): SignedTokenPair {
    return this.sign(
      { ...payload, type: 'access' },
      this.accessTokenTtlSeconds,
    );
  }

  createRefreshToken(payload: Omit<AuthTokenPayload, 'type'>): SignedTokenPair {
    return this.sign(
      { ...payload, type: 'refresh' },
      this.refreshTokenTtlSeconds,
    );
  }

  verifyRefreshToken(token: string): AuthTokenPayload {
    return this.verify(token, 'refresh');
  }

  verifyAccessToken(token: string): AuthTokenPayload {
    return this.verify(token, 'access');
  }

  private sign(
    payload: AuthTokenPayload,
    expiresInSeconds: number,
  ): SignedTokenPair {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: nowInSeconds,
      exp: nowInSeconds + expiresInSeconds,
    };
    const encodedHeader = this.toBase64Url(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    );
    const encodedPayload = this.toBase64Url(JSON.stringify(fullPayload));
    const signature = this.createSignature(encodedHeader, encodedPayload);

    return {
      token: `${encodedHeader}.${encodedPayload}.${signature}`,
      expiresInSeconds,
    };
  }

  private verify(token: string, tokenType: TokenKind): AuthTokenPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid token.');
    }

    const expectedSignature = this.createSignature(
      encodedHeader,
      encodedPayload,
    );
    const providedSignature = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      providedSignature.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(providedSignature, expectedSignatureBuffer)
    ) {
      throw new UnauthorizedException('Invalid token.');
    }

    const payload = JSON.parse(
      Buffer.from(this.fromBase64Url(encodedPayload), 'base64').toString(
        'utf8',
      ),
    ) as AuthTokenPayload & { exp: number };

    if (
      payload.type !== tokenType ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('Invalid token.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      tier: payload.tier,
      type: payload.type,
    };
  }

  private createSignature(
    encodedHeader: string,
    encodedPayload: string,
  ): string {
    return this.toBase64Url(
      createHmac('sha256', this.jwtSecret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64'),
    );
  }

  private toBase64Url(value: string): string {
    return Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private fromBase64Url(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (normalized.length % 4 || 4)) % 4;

    return `${normalized}${'='.repeat(padding)}`;
  }

  private parseTtl(
    value: string | undefined,
    fallbackInSeconds: number,
  ): number {
    if (!value) {
      return fallbackInSeconds;
    }

    if (/^\d+$/.test(value)) {
      return Number(value);
    }

    const match = value.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error(`Unsupported token TTL: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];

    if (unit === 's') {
      return amount;
    }

    if (unit === 'm') {
      return amount * 60;
    }

    if (unit === 'h') {
      return amount * 60 * 60;
    }

    return amount * 60 * 60 * 24;
  }

  private get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured.');
    }

    return secret;
  }

  private get accessTokenTtlSeconds(): number {
    return this.parseTtl(process.env.JWT_ACCESS_TTL, 15 * 60);
  }

  private get refreshTokenTtlSeconds(): number {
    return this.parseTtl(process.env.JWT_REFRESH_TTL, 7 * 24 * 60 * 60);
  }
}
