import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AttachmentsProcessor } from './processors/attachments.processor';
import { AttachmentsModule } from '../attachments/attachments.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const isDev = process.env.NODE_ENV === 'development';
        const hasRedisEnv = !!(process.env.REDIS_URL || process.env.REDIS_HOST);
        const connectionOptions = {
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          retryStrategy: isDev
            ? () => null
            : (times: number) => Math.min(times * 500, 5000),
        };

        if (process.env.REDIS_URL) {
          return {
            connection: {
              url: process.env.REDIS_URL,
              ...connectionOptions,
            },
          };
        }
        if (hasRedisEnv || isDev) {
          return {
            connection: {
              host: process.env.REDIS_HOST || 'localhost',
              port: Number(process.env.REDIS_PORT) || 6379,
              password: process.env.REDIS_PASSWORD || undefined,
              ...connectionOptions,
            },
          };
        }
        return {
          connection: {
            host: '127.0.0.1',
            port: 6379,
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableOfflineQueue: false,
            retryStrategy: () => null,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'attachments',
    }),
    AttachmentsModule,
    EventsModule,
  ],
  providers: [AttachmentsProcessor],
  exports: [BullModule],
})
export class QueueModule {}
