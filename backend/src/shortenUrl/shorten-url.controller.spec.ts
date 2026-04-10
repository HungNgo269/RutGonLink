import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';

describe('ShortenUrlController', () => {
  let controller: ShortenUrlController;
  let service: {
    shorten: jest.MockedFunction<ShortenUrlService['shorten']>;
    getDestinationUrl: jest.MockedFunction<
      ShortenUrlService['getDestinationUrl']
    >;
  };

  beforeEach(async () => {
    service = {
      shorten: jest.fn(),
      getDestinationUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenUrlController],
      providers: [
        {
          provide: ShortenUrlService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ShortenUrlController>(ShortenUrlController);
  });

  it('delegates the creation request to the service', async () => {
    service.shorten.mockResolvedValue({
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      shortenedUrl: 'https://sho.rt/abc1234',
    });

    const result = await controller.create(
      { url: 'https://example.com' },
      'https://sho.rt',
    );

    expect(service.shorten).toHaveBeenCalledWith(
      { url: 'https://example.com' },
      'https://sho.rt',
    );
    expect(result.shortCode).toBe('abc1234');
  });

  it('redirects with the resolved destination url', async () => {
    service.getDestinationUrl.mockResolvedValue('https://example.com');
    const response = {
      redirect: jest.fn(),
    };

    await controller.redirect('abc1234', response as never);

    expect(service.getDestinationUrl).toHaveBeenCalledWith('abc1234');
    expect(response.redirect).toHaveBeenCalledWith(302, 'https://example.com');
  });
});
