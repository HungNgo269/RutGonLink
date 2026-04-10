import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppLoggerService } from './logger/logger.service';

type FilterResponse = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | { message?: string | string[] };
};

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let loggerService: AppLoggerService;
  let logErrorSpy: jest.SpiedFunction<AppLoggerService['logError']>;
  let response: Pick<Response, 'status' | 'json'>;
  let request: Partial<Request>;

  beforeEach(() => {
    loggerService = new AppLoggerService();
    logErrorSpy = jest
      .spyOn(loggerService, 'logError')
      .mockResolvedValue(undefined);

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    request = {
      method: 'GET',
      originalUrl: '/missing-code',
    };

    filter = new AllExceptionsFilter(loggerService);
  });

  it('when catching an http exception, logs it and returns its status and message', () => {
    const exception = new NotFoundException('Short link not found.');

    filter.catch(exception, createHttpArgumentsHost(request, response));

    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        errorName: NotFoundException.name,
        message: 'Short link not found.',
        method: 'GET',
        path: '/missing-code',
      }),
    );
    expect(response.status).toHaveBeenCalledWith(404);

    const jsonMock = jest.mocked(response.json);
    const responseBody = jsonMock.mock.calls[0]?.[0] as FilterResponse;

    expect(responseBody.statusCode).toBe(404);
    expect(responseBody.path).toBe('/missing-code');
    expect(typeof responseBody.timestamp).toBe('string');
    expect(responseBody.response).toEqual(
      expect.objectContaining({
        message: 'Short link not found.',
      }),
    );
  });

  it('when catching a non-http error, logs it and returns internal server error', () => {
    const exception = new Error('Database exploded.');

    filter.catch(exception, createHttpArgumentsHost(request, response));

    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        errorName: Error.name,
        message: 'Internal Server Error',
      }),
    );
    expect(response.status).toHaveBeenCalledWith(500);

    const jsonMock = jest.mocked(response.json);
    const responseBody = jsonMock.mock.calls[0]?.[0] as FilterResponse;

    expect(responseBody.statusCode).toBe(500);
    expect(responseBody.response).toBe('Internal Server Error');
  });
});

function createHttpArgumentsHost(
  request: Partial<Request>,
  response: Pick<Response, 'status' | 'json'>,
): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
      getNext: jest.fn(),
    }),
    getType: jest.fn(),
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  } as unknown as ArgumentsHost;
}
