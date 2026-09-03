import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CaptchaService } from './captcha.service';

@ApiTags('captcha')
@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Get()
  @ApiOperation({ summary: 'Generate SVG Captcha image and ID' })
  @ApiResponse({ status: 200, description: 'Returns captchaId and captchaSvg' })
  async getCaptcha() {
    return this.captchaService.generateCaptcha();
  }
}
