/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

const REFRESH_COOKIE_NAME = 'refreshToken';

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description:
      'User registered successfully with in-memory access token and httpOnly cookie',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT Access Token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto?: RefreshTokenDto,
  ) {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
    const tokenFromBody = dto?.refreshToken;

    // Anti-CSRF check: When using cookies, require custom header in production
    if (tokenFromCookie) {
      const requestedWith = req.headers['x-requested-with'];
      if (!requestedWith && process.env.NODE_ENV === 'production') {
        throw new ForbiddenException('Anti-CSRF header missing');
      }
    }

    const token = tokenFromCookie || tokenFromBody;
    if (!token) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refreshTokens({
      refreshToken: token,
    });
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      await this.authService.revokeToken(token);
    }

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Returns authenticated user' })
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      home_page: user.home_page,
      created_at: user.created_at,
    };
  }
}
