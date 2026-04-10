import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '../all-exceptions.filter';
import { AppLoggerService } from './logger.service';

@Module({
  providers: [
    AppLoggerService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [AppLoggerService],
})
export class LoggerModule {}
