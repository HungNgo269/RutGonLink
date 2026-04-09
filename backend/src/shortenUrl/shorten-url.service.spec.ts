import { BadRequestException } from '@nestjs/common';
import { ShortenUrlService } from './shorten-url.service';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { nanoid } from 'nanoid';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

describe('ShortenUrlService', () => {
  let service: ShortenUrlService;

  beforeEach(() => {
    service = new ShortenUrlService();
    jest.mocked(nanoid).mockReturnValue('abc1234');
  });

  it('when shortening a valid url, returns the shortened payload', () => {
    const request: CreateShortenUrlDto = {
      url: 'https://example.com/articles/nest',
    };

    const result = service.shorten(request, 'https://sho.rt');

    expect(result).toEqual({
      originalUrl: 'https://example.com/articles/nest',
      shortCode: 'abc1234',
      shortenedUrl: 'https://sho.rt/abc1234',
    });
  });

  it('when the url is invalid, throws bad request', () => {
    const request: CreateShortenUrlDto = {
      url: 'not-a-valid-url',
    };

    expect(() => service.shorten(request, 'https://sho.rt')).toThrow(
      BadRequestException,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
