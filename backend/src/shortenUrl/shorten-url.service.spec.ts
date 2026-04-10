import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShortenUrlService } from './shorten-url.service';
import { CreateShortenUrlDto } from './dto/create-shorten-url.dto';
import { nanoid } from 'nanoid';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

describe('ShortenUrlService', () => {
  let service: ShortenUrlService;
  let prismaService: {
    shortenedLink: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      shortenedLink: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    service = new ShortenUrlService(prismaService as unknown as PrismaService);
    jest.mocked(nanoid).mockReturnValue('abc1234');
  });

  it('when shortening a valid url, returns the shortened payload', async () => {
    const request: CreateShortenUrlDto = {
      url: 'https://example.com/articles/nest',
    };
    prismaService.shortenedLink.findUnique.mockResolvedValue(null);
    prismaService.shortenedLink.create.mockResolvedValue({});

    const result = await service.shorten(request, 'https://sho.rt');

    expect(result).toEqual({
      originalUrl: 'https://example.com/articles/nest',
      shortCode: 'abc1234',
      shortenedUrl: 'https://sho.rt/abc1234',
    });
    expect(prismaService.shortenedLink.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shortCode: 'abc1234',
        destinationUrl: 'https://example.com/articles/nest',
      }),
    });
  });

  it('when the url is invalid, throws bad request', async () => {
    const request: CreateShortenUrlDto = {
      url: 'not-a-valid-url',
    };

    await expect(service.shorten(request, 'https://sho.rt')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('when resolving an active short code, returns the destination url', async () => {
    prismaService.shortenedLink.findUnique.mockResolvedValue({
      destinationUrl: 'https://example.com/articles/nest',
      isActive: true,
      expiresAt: null,
    });

    await expect(service.getDestinationUrl('abc1234')).resolves.toBe(
      'https://example.com/articles/nest',
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
