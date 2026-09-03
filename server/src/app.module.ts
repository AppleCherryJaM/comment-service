/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

import { User } from './modules/users/entities/user.entity';
import { Comment } from './modules/comments/entities/comment.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CaptchaModule } from './modules/captcha/captcha.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'comments_db',
      entities: [User, Comment, RefreshToken],
      synchronize: true, // Auto-create tables in dev
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.env.UPLOAD_DIR || './uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    UsersModule,
    AuthModule,
    CommentsModule,
    CaptchaModule,
    AttachmentsModule,
    EventsModule,
  ],
})
export class AppModule {}
