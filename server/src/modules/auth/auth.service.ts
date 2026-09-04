import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.createUser(dto);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: dto.refreshToken },
      relations: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (new Date() > storedToken.expires_at) {
      await this.refreshTokenRepository.remove(storedToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Delete old token
    await this.refreshTokenRepository.remove(storedToken);

    return this.generateTokens(storedToken.user);
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token });
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = this.jwtService.sign(payload);

    const refreshTokenString = bcrypt.hashSync(
      user.id + Date.now().toString(),
      10,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshTokenObj = this.refreshTokenRepository.create({
      user_id: user.id,
      token: refreshTokenString,
      expires_at: expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenObj);

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        home_page: user.home_page,
      },
    };
  }
}
