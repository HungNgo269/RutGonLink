import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type ShortenedLinkRecord = {
  id: bigint;
  shortCode: string;
  destinationUrl: string;
  isActive: boolean;
  expiresAt: Date | null;
};

type ShortenUrlResponseBody = {
  originalUrl: string;
  shortCode: string;
  shortenedUrl: string;
};

type ErrorResponseBody = {
  message: string;
};

type CreateShortenedLinkArgs = {
  data: ShortenedLinkRecord;
};

type FindUniqueShortenedLinkArgs = {
  select?: Partial<Record<keyof ShortenedLinkRecord, boolean>>;
  where: {
    shortCode: string;
  };
};

jest.mock('../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {
    private readonly links = new Map<string, ShortenedLinkRecord>();

    shortenedLink = {
      create: jest.fn((args: CreateShortenedLinkArgs) =>
        this.createShortenedLink(args),
      ),
      findUnique: jest.fn((args: FindUniqueShortenedLinkArgs) =>
        this.findUniqueShortenedLink(args),
      ),
    };

    private createShortenedLink({
      data,
    }: CreateShortenedLinkArgs): Promise<ShortenedLinkRecord> {
      this.links.set(data.shortCode, {
        id: data.id,
        shortCode: data.shortCode,
        destinationUrl: data.destinationUrl,
        isActive: true,
        expiresAt: null,
      });

      return Promise.resolve(data);
    }

    private findUniqueShortenedLink({
      where,
      select,
    }: FindUniqueShortenedLinkArgs): Promise<
      Partial<ShortenedLinkRecord> | ShortenedLinkRecord | null
    > {
      const link = this.links.get(where.shortCode) ?? null;

      if (!link) {
        return Promise.resolve(null);
      }

      if (!select) {
        return Promise.resolve(link);
      }

      const selected: Partial<ShortenedLinkRecord> = {};

      for (const key of Object.keys(select) as Array<
        keyof ShortenedLinkRecord
      >) {
        setSelectedShortenedLinkField(selected, link, key);
      }

      return Promise.resolve(selected);
    }
  },
}));

function setSelectedShortenedLinkField(
  selected: Partial<ShortenedLinkRecord>,
  link: ShortenedLinkRecord,
  key: keyof ShortenedLinkRecord,
): void {
  switch (key) {
    case 'destinationUrl':
      selected.destinationUrl = link.destinationUrl;
      return;
    case 'expiresAt':
      selected.expiresAt = link.expiresAt;
      return;
    case 'id':
      selected.id = link.id;
      return;
    case 'isActive':
      selected.isActive = link.isActive;
      return;
    case 'shortCode':
      selected.shortCode = link.shortCode;
      return;
  }
}

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
        const responseBody = parseShortenUrlResponseBody(body);

        expect(responseBody.originalUrl).toBe(
          'https://example.com/very/long/link',
        );
        expect(responseBody.shortCode).toMatch(/^[A-Za-z0-9_-]{7}$/);
        expect(responseBody.shortenedUrl).toMatch(
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
    const createResponseBody = parseShortenUrlResponseBody(createResponse.body);

    await request(app.getHttpServer())
      .get(`/${createResponseBody.shortCode}`)
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
        const responseBody = parseErrorResponseBody(body);

        expect(responseBody.message).toBe('Invalid URL format.');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});

function parseShortenUrlResponseBody(body: unknown): ShortenUrlResponseBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Expected shorten URL response body to be an object.');
  }

  const candidate = body as Record<string, unknown>;

  if (
    typeof candidate.originalUrl !== 'string' ||
    typeof candidate.shortCode !== 'string' ||
    typeof candidate.shortenedUrl !== 'string'
  ) {
    throw new Error('Expected shorten URL response body shape.');
  }

  return {
    originalUrl: candidate.originalUrl,
    shortCode: candidate.shortCode,
    shortenedUrl: candidate.shortenedUrl,
  };
}

function parseErrorResponseBody(body: unknown): ErrorResponseBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Expected error response body to be an object.');
  }

  const candidate = body as Record<string, unknown>;

  if (typeof candidate.message !== 'string') {
    throw new Error('Expected error response body shape.');
  }

  return {
    message: candidate.message,
  };
}
