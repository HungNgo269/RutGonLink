import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';

describe('ShortenUrlController', () => {
  let controller: ShortenUrlController;
  let service: jest.Mocked<ShortenUrlService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenUrlController],
      providers: [
        {
          provide: ShortenUrlService,
          useValue: {
            shorten: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShortenUrlController>(ShortenUrlController);
    service = module.get(ShortenUrlService);
  });

  it('delegates the request to the service', () => {
    service.shorten.mockReturnValue({
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      shortenedUrl: 'https://sho.rt/abc1234',
    });

    const result = controller.create(
      { url: 'https://example.com' },
      'https://sho.rt',
    );

    expect(service.shorten).toHaveBeenCalledWith(
      { url: 'https://example.com' },
      'https://sho.rt',
    );
    expect(result.shortCode).toBe('abc1234');
  });
});
