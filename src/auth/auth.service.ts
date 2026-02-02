import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dtos/register.dto';
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { LoginDto } from './dtos/login.dto';
import { User } from '../../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './types/jwt-payload';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterUserDto) {
    try {
      const { password, ...data } = dto;
      const hasedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hasedPassword,
        },
        omit: {
          password: true,
          refreshToken: true,
        },
      });
      return user;
    } catch (error) {
      console.log('🚀 ~ AuthService ~ register ~ error:', error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `User with this email "${dto.email}" already exist`,
          );
        }
      }
      throw new InternalServerErrorException(
        'Error while register user. Retry later',
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      const { email, password } = dto;

      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new UnauthorizedException('Email or passwod incorrect');
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        user.password || '',
      );
      if (!isPasswordMatch) {
        throw new UnauthorizedException('Email or passwod incorrect');
      }

      const [accesToken, refreshToken] = await this.generateTokens(user);
      const hashedRefresToken = await bcrypt.hash(refreshToken, 10);
      const result = await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefresToken },
        omit: {
          password: true,
          refreshToken: true,
        },
      });

      return {
        ...result,
        token: accesToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.log('🚀 ~ AuthService ~ login ~ error:', error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw new InternalServerErrorException('Error while log in. retry later');
    }
  }

  async getUserInfo(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        omit: {
          password: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`Le user avec l'id ${userId} n'existe pas`);
      }

      if (user.refreshToken === null) {
        throw new UnauthorizedException('Anthication failed: User logged out');
      }

      return user;
    } catch (error) {
      console.log('🚀 ~ AuthService ~ getUserInfo ~ error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error while getting user infos. retry later',
      );
    }
  }

  async logout(userId: number) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          refreshToken: null,
        },
      });

      if (!user) {
        throw new BadRequestException(
          `Le user avec l'id ${userId} n'existe pas`,
        );
      }

      return { message: 'user logged out successfuly', user };
    } catch (error) {
      console.log('🚀 ~ AuthService ~ logout ~ error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error while logging out user. retry later',
      );
    }
  }

  private generateTokens(user: User): Promise<[string, string]> {
    const payload: JWTPayload = { sub: user.id, email: user.email };
    return Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.config.getOrThrow<string>('REFRESH_JWT_SECRET'),
      }),
    ]);
  }
}
