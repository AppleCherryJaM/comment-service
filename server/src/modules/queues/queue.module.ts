import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AttachmentsProcessor } from './processors/attachments.processor';
import { AttachmentsModule } from '../attachments/attachments.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        if (process.env.REDIS_URL) {
          return {
            connection: {
              url: process.env.REDIS_URL,
            },
          };
        }
        return {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
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
