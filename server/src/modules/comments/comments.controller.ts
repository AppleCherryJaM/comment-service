/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new comment or reply to an existing comment',
  })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  async createComment(
    @Body() dto: CreateCommentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.commentsService.createComment(dto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of top-level comments with nested replies',
  })
  @ApiResponse({ status: 200, description: 'Paginated comments tree returned' })
  async getComments(@Query() query: GetCommentsQueryDto) {
    return this.commentsService.getPaginatedComments(query);
  }
}
