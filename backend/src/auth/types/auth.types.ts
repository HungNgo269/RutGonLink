export type TokenKind = 'access' | 'refresh';

export type AuthTokenPayload = {
  sub: string;
  email: string;
  tier: string;
  type: TokenKind;
};
