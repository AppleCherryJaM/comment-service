/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CaptchaService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    this.redis.on('error', (err) => {
      // Prevent unhandled error event crash when Redis is offline
      console.warn('⚠️ [Redis Captcha Warning]:', err.message);
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

  // Fallback in-memory map for when Redis is offline in local dev
  private memoryCaptchaStore = new Map<string, string>();

  async generateCaptcha(): Promise<{ captchaId: string; captchaSvg: string }> {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 2,
      color: true,
      background: '#f0f0f0',
      width: 150,
      height: 50,
      fontSize: 45,
    });

    const captchaId = uuidv4();
    const code = captcha.text.toLowerCase();

    const redis = await this.getRedisConnection();
    if (redis && redis.status === 'ready') {
      await redis.set(`captcha:${captchaId}`, code, 'EX', 300);
    } else {
      this.memoryCaptchaStore.set(captchaId, code);
      setTimeout(() => this.memoryCaptchaStore.delete(captchaId), 300000);
    }

    return {
      captchaId,
      captchaSvg: captcha.data,
    };
  }

  async validateCaptcha(captchaId: string, code: string): Promise<boolean> {
    if (!captchaId || !code) {
      throw new BadRequestException('Captcha ID and code are required');
    }

    const redis = await this.getRedisConnection();
    let storedCode: string | null = null;

    if (redis && redis.status === 'ready') {
      const key = `captcha:${captchaId}`;
      storedCode = await redis.get(key);
      if (storedCode) {
        await redis.del(key);
      }
    } else {
      storedCode = this.memoryCaptchaStore.get(captchaId) || null;
      if (storedCode) {
        this.memoryCaptchaStore.delete(captchaId);
      }
    }

    if (!storedCode) {
      return false;
    }

    return storedCode.toLowerCase() === code.trim().toLowerCase();
  }
}
