import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { getApiGlobalPrefix } from '../../http-api.config';

export const BaseUrl = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = `${request.protocol}://${request.get('host')}`;
    const apiGlobalPrefix = getApiGlobalPrefix();

    return apiGlobalPrefix ? `${origin}/${apiGlobalPrefix}` : origin;
  },
);
