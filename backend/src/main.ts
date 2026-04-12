import 'dotenv/config';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import {
  buildPrefixedPath,
  getApiGlobalPrefix,
  SWAGGER_DOCUMENT_PATH,
} from './http-api.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiGlobalPrefix = getApiGlobalPrefix();

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({
    origin: getAllowedCorsOrigins(),
    credentials: true,
  });
  if (apiGlobalPrefix) {
    app.setGlobalPrefix(apiGlobalPrefix);
  }
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

function setupSwagger(app: INestApplication) {
  const apiGlobalPrefix = getApiGlobalPrefix();
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('RutGonLink API')
      .setDescription(
        'Short link, authentication, tracking, and analytics API.',
      )
      .setVersion('1.0')
      .addServer(`/${apiGlobalPrefix}`)
      .build(),
  );

  SwaggerModule.setup(buildPrefixedPath(SWAGGER_DOCUMENT_PATH), app, document);
}

function getAllowedCorsOrigins(): string[] {
  const configuredOrigins = process.env.CORS_ORIGINS;

  if (!configuredOrigins) {
    return ['http://localhost:5173'];
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

void bootstrap();
