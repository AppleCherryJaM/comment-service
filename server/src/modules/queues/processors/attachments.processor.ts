import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AttachmentsService } from '../../attachments/attachments.service';

export interface ProcessAttachmentJobData {
  tempFilePath: string;
  originalName: string;
  mimeType: string;
  size: number;
}

@Processor('attachments')
export class AttachmentsProcessor extends WorkerHost {
  private readonly logger = new Logger(AttachmentsProcessor.name);

  constructor(private readonly attachmentsService: AttachmentsService) {
    super();
  }

  async process(job: Job<ProcessAttachmentJobData>): Promise<any> {
    this.logger.log(`[BullMQ Worker] Processing attachment job #${job.id}: ${job.data.originalName}`);
    
    try {
      const result = await this.attachmentsService.processFileFromQueue(job.data);
      this.logger.log(`[BullMQ Worker] Finished job #${job.id}: ${result.fileUrl}`);
      return result;
    } catch (err: any) {
      this.logger.error(`[BullMQ Worker] Failed job #${job.id}: ${err.message}`, err.stack);
      throw err;
    }
  }
}
