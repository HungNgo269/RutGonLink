import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, RequestMethod } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getApiGlobalPrefix } from './../src/http-api.config';

type StoredShortenedLink = {
  id: bigint;
  shortCode: string;
  destinationUrl: string;
  isActive: boolean;
  expiresAt: Date | null;
};

type CreateShortenedLinkArgs = {
  data: Pick<StoredShortenedLink, 'id' | 'shortCode' | 'destinationUrl'>;
};

type FindUniqueShortenedLinkArgs = {
  where: Pick<StoredShortenedLink, 'shortCode'>;
  select?: Partial<Record<keyof StoredShortenedLink, boolean>>;
};

type ShortenedUrlResponse = {
  originalUrl: string;
  shortCode: string;
  shortenedUrl: string;
};

type ErrorResponse = {
  response: {
    message: string;
  };
};

jest.mock('../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {
    private readonly links = new Map<string, StoredShortenedLink>();

    shortenedLink = {
      create: jest.fn(({ data }: CreateShortenedLinkArgs) => {
        this.links.set(data.shortCode, {
          id: data.id,
          shortCode: data.shortCode,
          destinationUrl: data.destinationUrl,
          isActive: true,
          expiresAt: null,
        });

        return Promise.resolve(data);
      }),
      findUnique: jest.fn(({ where, select }: FindUniqueShortenedLinkArgs) => {
        const link = this.links.get(where.shortCode) ?? null;

        if (!link) {
          return Promise.resolve(null);
        }

        if (!select) {
          return Promise.resolve(link);
        }

        const selected = Object.fromEntries(
          Object.entries(select).map(([key]) => [
            key,
            link[key as keyof StoredShortenedLink],
          ]),
        );

        return Promise.resolve(selected);
      }),
    };
  },
}));

jest.mock('../src/redis/redis.service', () => ({
  RedisService: class RedisService {
    get = jest.fn().mockResolvedValue(null);
    set = jest.fn().mockResolvedValue(undefined);
    del = jest.fn().mockResolvedValue(undefined);
  },
}));

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const apiPrefix = `/${getApiGlobalPrefix()}`;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(getApiGlobalPrefix(), {
      exclude: [{ path: ':shortCode', method: RequestMethod.GET }],
    });
    await app.init();
  });

  it('/v1/app (GET)', () => {
    return request(app.getHttpServer())
      .get(apiPrefix)
      .expect(200)
      .expect('Hello World!');
  });

  it('/v1/app/shorten-url (POST)', () => {
    return request(app.getHttpServer())
      .post(`${apiPrefix}/shorten-url`)
      .send({
        url: 'https://example.com/very/long/link',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as ShortenedUrlResponse;

        expect(body.originalUrl).toBe('https://example.com/very/long/link');
        expect(body.shortCode).toMatch(/^[A-Za-z0-9_-]{7}$/);
        expect(body.shortenedUrl).toMatch(
          /^http:\/\/127\.0\.0\.1:\d+\/[A-Za-z0-9_-]{7}$/,
        );
      });
  });

  it('/:shortCode (GET) redirects to the original destination', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`${apiPrefix}/shorten-url`)
      .send({
        url: 'https://example.com/very/long/link',
      })
      .expect(201);
    const createResponseBody = createResponse.body as ShortenedUrlResponse;

    await request(app.getHttpServer())
      .get(`/${createResponseBody.shortCode}`)
      .expect(302)
      .expect('Location', 'https://example.com/very/long/link');
  });

  it('/v1/app/shorten-url (POST) rejects invalid url', () => {
    return request(app.getHttpServer())
      .post(`${apiPrefix}/shorten-url`)
      .send({
        url: 'invalid-url',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as ErrorResponse;

        expect(body.response.message).toBe('Invalid URL format.');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
