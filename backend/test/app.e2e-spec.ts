import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

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
