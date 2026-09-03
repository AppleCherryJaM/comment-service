import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: RegisterDto): Promise<User> {
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingName = await this.userRepository.findOne({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException('User with this name already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByNameOrCreateGuest(
    name: string,
    email: string,
    homePage?: string,
  ): Promise<User> {
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      user = await this.userRepository.findOne({ where: { name } });
    }

    if (user) {
      return user;
    }

    // Auto-create guest user for commenting without prior manual registration
    const defaultPassword = await bcrypt.hash(Math.random().toString(36), 10);
    user = this.userRepository.create({
      name,
      email,
      password: defaultPassword,
      home_page: homePage,
    });

    return this.userRepository.save(user);
  }
}
