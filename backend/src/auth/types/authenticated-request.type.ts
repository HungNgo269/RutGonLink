import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  authSessionSource: 'access' | 'refresh';
  userId: bigint;
};
