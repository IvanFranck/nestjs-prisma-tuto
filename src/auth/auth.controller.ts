import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RefreshJwtGuard } from '../common/guards/refresh-jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authServcie: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return await this.authServcie.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authServcie.login(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getUserInfos(@GetUser('id') userId: number) {
    return await this.authServcie.getUserInfo(userId);
  }

  @Post('logout')
  @UseGuards(RefreshJwtGuard)
  async logout(@GetUser('id') userId: number) {
    return await this.authServcie.logout(userId);
  }
}
