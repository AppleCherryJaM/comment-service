/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOriginsEnv = process.env.CORS_ORIGINS || process.env.CLIENT_URL;
  const configuredOrigins = corsOriginsEnv
    ? corsOriginsEnv
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser or server-to-server requests (curl, docker internal, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // If CORS_ORIGINS is omitted or '*' allow all origins
      if (!corsOriginsEnv || corsOriginsEnv === '*' || configuredOrigins.includes('*')) {
        return callback(null, true);
      }

      // Allow explicitly configured origins from environment
      if (configuredOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Render deployment domain dynamically (*.onrender.com)
      if (/\.onrender\.com$/.test(origin)) {
        return callback(null, true);
      }

      // In local development, dynamically allow any port on localhost / 127.0.0.1
      if (
        process.env.NODE_ENV !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    },
    credentials: true,
  });

  app.use(cookieParser());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  // Serve static uploaded files at /uploads
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
  app.use('/uploads', express.static(uploadDir));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('SPA Comments API')
    .setDescription(
      'Fullstack SPA Comments application API with JWT, WebSockets, XHTML sanitization, and Redis caching',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 NestJS Server is running on: http://localhost:${port}/api`);
  console.log(
    `📚 Swagger API Docs available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
