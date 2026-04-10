import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

@Injectable()
export class PasswordHashService {
  hash(value: string): string {
    const salt = randomBytes(16).toString('hex');
    const digest = scryptSync(value, salt, 64).toString('hex');

    return `${salt}:${digest}`;
  }

  matches(value: string, hashedValue: string): boolean {
    const [salt, digest] = hashedValue.split(':');

    if (!salt || !digest) {
      return false;
    }

    const hashedBuffer = Buffer.from(digest, 'hex');
    const candidateBuffer = scryptSync(value, salt, hashedBuffer.length);

    return timingSafeEqual(hashedBuffer, candidateBuffer);
  }
}
