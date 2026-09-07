import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { FileType } from '../comments/entities/comment.entity';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file attachment (image or text)' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is missing');
    }
    const processed = await this.attachmentsService.processAndSaveFile(file);
    return {
      id: uuidv4(),
      fileName: file.originalname,
      fileUrl: processed.fileUrl,
      fileType: processed.fileType === FileType.IMAGE ? 'image' : 'text',
      fileSize: file.size,
    };
  }
}
