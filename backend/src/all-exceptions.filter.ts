import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaClientValidationError } from '@prisma/client/runtime/client';
import { Request, Response } from 'express';
import { AppLoggerService } from './logger/logger.service';

type MyResponseObj = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly loggerService: AppLoggerService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();
    const myResponseObj = this.createResponseObject(exception, request);

    response.status(myResponseObj.statusCode).json(myResponseObj);

    void this.loggerService
      .logError({
        timestamp: myResponseObj.timestamp,
        statusCode: myResponseObj.statusCode,
        errorName: this.resolveErrorName(exception),
        message: this.resolveLogMessage(exception, myResponseObj.response),
        method: request?.method,
        path: myResponseObj.path,
        stack: exception instanceof Error ? exception.stack : undefined,
        details: this.resolveDetails(myResponseObj.response),
      })
      .catch((logError: unknown) => {
        const loggingFailure =
          logError instanceof Error
            ? logError.message
            : 'Unknown logging error';
        process.stderr.write(
          `[AllExceptionsFilter] Failed to write error log: ${loggingFailure}\n`,
        );
      });
  }

  private createResponseObject(
    exception: unknown,
    request: Request,
  ): MyResponseObj {
    const myResponseObj: MyResponseObj = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request?.originalUrl ?? request?.url ?? '',
      response: 'Internal Server Error',
    };

    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();

      return myResponseObj;
    }

    if (exception instanceof PrismaClientValidationError) {
      myResponseObj.statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      myResponseObj.response = exception.message.replaceAll(/\n/g, ' ');
    }

    return myResponseObj;
  }

  private resolveLogMessage(
    exception: unknown,
    responseBody: string | object,
  ): string {
    if (typeof responseBody === 'string') {
      return responseBody;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return JSON.stringify(responseBody);
  }

  private resolveErrorName(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.name;
    }

    return 'UnhandledException';
  }

  private resolveDetails(responseBody: string | object): string | undefined {
    if (typeof responseBody === 'string') {
      return undefined;
    }

    return JSON.stringify(responseBody);
  }
}
