/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { FileType } from '../comments/entities/comment.entity';

@Injectable()
export class AttachmentsService {
  private uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async processAndSaveFile(
    file: Express.Multer.File,
  ): Promise<{ fileUrl: string; fileType: FileType }> {
    if (!file) {
      throw new BadRequestException('File is missing');
    }

    const mime = file.mimetype.toLowerCase();
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage =
      ['image/jpeg', 'image/png', 'image/gif'].includes(mime) ||
      ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    const isTxt = mime.startsWith('text/') || ext === '.txt';

    if (!isImage && !isTxt) {
      throw new BadRequestException(
        'Unsupported file type. Only JPG, PNG, GIF images and TXT files are allowed.',
      );
    }

    if (isTxt) {
      // Check size: max 100 KB (100 * 1024 bytes)
      if (file.size > 100 * 1024) {
        throw new BadRequestException('Text file size must not exceed 100 KB');
      }

      const fileName = `txt_${uuidv4()}${ext || '.txt'}`;
      const filePath = path.join(this.uploadDir, fileName);
      await fs.promises.writeFile(filePath, file.buffer);

      return {
        fileUrl: `/uploads/${fileName}`,
        fileType: FileType.TXT,
      };
    }

    // Handle Image
    try {
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      const maxW = 320;
      const maxH = 240;

      let resized = image;
      if (
        (metadata.width && metadata.width > maxW) ||
        (metadata.height && metadata.height > maxH)
      ) {
        resized = image.resize(maxW, maxH, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      const fileName = `img_${uuidv4()}${ext || '.png'}`;
      const filePath = path.join(this.uploadDir, fileName);

      await resized.toFile(filePath);

      return {
        fileUrl: `/uploads/${fileName}`,
        fileType: FileType.IMAGE,
      };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(`Failed to process image: ${err.message}`);
    }
  }
}
