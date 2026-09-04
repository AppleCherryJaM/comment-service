/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  GetCommentsQueryDto,
  SortByField,
  SortOrder,
} from './dto/get-comments-query.dto';
import { UsersService } from '../users/users.service';
import { CaptchaService } from '../captcha/captcha.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { CommentsGateway } from '../events/comments.gateway';
import { validateAndSanitizeXHTML } from './utils/xhtml-validator';
import { Redis } from 'ioredis';

@Injectable()
export class CommentsService {
  private redis: Redis;

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly usersService: UsersService,
    private readonly captchaService: CaptchaService,
    private readonly attachmentsService: AttachmentsService,
    private readonly commentsGateway: CommentsGateway,
  ) {
    const isDev = process.env.NODE_ENV === 'development';

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: isDev
        ? () => null
        : (times) => Math.min(times * 100, 3000),
    });

    let hasLogged = false;
    this.redis.on('error', (err) => {
      if (!isDev) {
        console.warn('⚠️ [Redis Comments Warning]:', err.message);
      } else if (!hasLogged) {
        hasLogged = true;
        console.log(
          'ℹ️ [Redis Comments]: Dev mode — Redis offline, caching disabled.',
        );
      }
    });
  }

  private async getRedisConnection(): Promise<Redis | null> {
    try {
      if (this.redis.status !== 'ready' && this.redis.status !== 'connecting') {
        await this.redis.connect();
      }
      return this.redis;
    } catch {
      return null;
    }
  }

  async createComment(
    dto: CreateCommentDto,
    file?: Express.Multer.File,
  ): Promise<Comment> {
    // 1. Validate CAPTCHA
    const isCaptchaValid = await this.captchaService.validateCaptcha(
      dto.captchaId,
      dto.captchaCode,
    );
    if (!isCaptchaValid) {
      throw new BadRequestException('Invalid or expired CAPTCHA code');
    }

    // 2. Validate & Sanitize XHTML text
    const sanitizedText = validateAndSanitizeXHTML(dto.text);

    // 3. Find or Create User
    const user = await this.usersService.findByNameOrCreateGuest(
      dto.userName,
      dto.email,
      dto.homePage,
    );

    // 4. Handle Parent & Root Comment
    let parentComment: Comment | null = null;
    let rootCommentId: string | null = null;

    if (dto.parentCommentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentCommentId },
      });
      if (!parentComment) {
        throw new NotFoundException(
          `Parent comment with ID ${dto.parentCommentId} not found`,
        );
      }
      rootCommentId = parentComment.root_comment_id || parentComment.id;
    }

    // 5. Handle File Attachment
    let fileUrl: string | undefined;
    let fileType: any;

    if (file) {
      const processed = await this.attachmentsService.processAndSaveFile(file);
      fileUrl = processed.fileUrl;
      fileType = processed.fileType;
    }

    // 6. Save Comment
    const newComment = this.commentRepository.create({
      text: sanitizedText,
      user_id: user.id,
      user,
      parent_comment_id: dto.parentCommentId || undefined,
      root_comment_id: rootCommentId || undefined,
      file_url: fileUrl,
      file_type: fileType,
    });

    const savedComment = await this.commentRepository.save(newComment);

    // 7. Emit WebSocket Notification
    this.commentsGateway.notifyNewComment(savedComment);

    // 8. Invalidate Redis Page Cache
    await this.clearRedisCache();

    return savedComment;
  }

  async getPaginatedComments(query: GetCommentsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const sortBy = query.sortBy || SortByField.CREATED_AT;
    const sortOrder = query.sortOrder || SortOrder.DESC;

    const cacheKey = `comments:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;

    // Try Redis Cache for page 1
    const redis = await this.getRedisConnection();
    if (page === 1 && redis && redis.status === 'ready') {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {
        /* empty */
      }
    }

    // QUERY 1: Fetch 25 Root Comments (parent_comment_id IS NULL)
    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.parent_comment_id IS NULL');

    if (sortBy === SortByField.USER_NAME) {
      qb.orderBy('user.name', sortOrder);
    } else if (sortBy === SortByField.EMAIL) {
      qb.orderBy('user.email', sortOrder);
    } else {
      qb.orderBy('comment.created_at', sortOrder);
    }

    const [rootComments, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (rootComments.length === 0) {
      const emptyResult = {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
      return emptyResult;
    }

    // QUERY 2: Fetch ALL child replies for those 25 root comments in EXACTLY 1 query (0% N+1)
    const rootIds = rootComments.map((rc) => rc.id);

    const allChildComments = await this.commentRepository.find({
      where: {
        root_comment_id: In(rootIds),
      },
      relations: { user: true },
      order: {
        created_at: 'ASC',
      },
    });

    // Assemble nested tree in memory
    const commentMap = new Map<string, any>();

    // Put root comments in map
    for (const rc of rootComments) {
      commentMap.set(rc.id, { ...rc, replies: [] });
    }

    // Put child comments in map
    for (const cc of allChildComments) {
      commentMap.set(cc.id, { ...cc, replies: [] });
    }

    // Build parent-child relationships
    for (const cc of allChildComments) {
      const parentNode = commentMap.get(cc.parent_comment_id!);
      const selfNode = commentMap.get(cc.id);
      if (parentNode) {
        parentNode.replies.push(selfNode);
      }
    }

    const data = rootComments.map((rc) => commentMap.get(rc.id));

    const responseData = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Store in Redis cache for 60 seconds (for page 1)
    if (page === 1 && redis && redis.status === 'ready') {
      try {
        await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60);
      } catch {
        /* empty */
      }
    }

    return responseData;
  }

  private async clearRedisCache() {
    const redis = await this.getRedisConnection();
    if (redis && redis.status === 'ready') {
      try {
        const keys = await redis.keys('comments:page:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch {
        /* empty */
      }
    }
  }
}
