import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AttachmentsProcessor } from './processors/attachments.processor';
import { AttachmentsModule } from '../attachments/attachments.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      }),
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
