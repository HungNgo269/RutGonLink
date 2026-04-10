import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

jest.mock('../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {
    private readonly links = new Map<
      string,
      {
        id: bigint;
        shortCode: string;
        destinationUrl: string;
        isActive: boolean;
        expiresAt: Date | null;
      }
    >();

    shortenedLink = {
      create: jest.fn(({ data }) => {
        this.links.set(data.shortCode, {
          id: data.id,
          shortCode: data.shortCode,
          destinationUrl: data.destinationUrl,
          isActive: true,
          expiresAt: null,
        });

        return Promise.resolve(data);
      }),
      findUnique: jest.fn(({ where, select }) => {
        const link = this.links.get(where.shortCode) ?? null;

        if (!link) {
          return Promise.resolve(null);
        }

        if (!select) {
          return Promise.resolve(link);
        }

        const selected = Object.fromEntries(
          Object.entries(select).map(([key]) => [key, link[key]]),
        );

        return Promise.resolve(selected);
      }),
    };
  },
}));

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/shorten-url (POST)', () => {
    return request(app.getHttpServer())
      .post('/shorten-url')
      .send({
        url: 'https://example.com/very/long/link',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.originalUrl).toBe('https://example.com/very/long/link');
        expect(body.shortCode).toMatch(/^[A-Za-z0-9_-]{7}$/);
        expect(body.shortenedUrl).toMatch(
          /^http:\/\/127\.0\.0\.1:\d+\/[A-Za-z0-9_-]{7}$/,
        );
      });
  });

  it('/:shortCode (GET) redirects to the original destination', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/shorten-url')
      .send({
        url: 'https://example.com/very/long/link',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/${createResponse.body.shortCode}`)
      .expect(302)
      .expect('Location', 'https://example.com/very/long/link');
  });

  it('/shorten-url (POST) rejects invalid url', () => {
    return request(app.getHttpServer())
      .post('/shorten-url')
      .send({
        url: 'invalid-url',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('Invalid URL format.');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
