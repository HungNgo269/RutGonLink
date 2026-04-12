import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const BaseUrl = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const configuredPublicBaseUrl = process.env.SHORTEN_URL_PUBLIC_BASE_URL;

    if (configuredPublicBaseUrl) {
      return configuredPublicBaseUrl.replace(/\/+$/, '');
    }

    const request = context.switchToHttp().getRequest<Request>();

    return `${request.protocol}://${request.get('host')}`;
  },
);
