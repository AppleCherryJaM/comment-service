/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { QueueModule } from './modules/queues/queue.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProd = process.env.NODE_ENV === 'production';
        if (process.env.DATABASE_URL) {
          return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Comment, RefreshToken],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          };
        }
        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_DATABASE || 'comments_db',
          entities: [User, Comment, RefreshToken],
          synchronize: true,
          ssl: isProd || process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        };
      },
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
    QueueModule,
  ],
})
export class AppModule {}
