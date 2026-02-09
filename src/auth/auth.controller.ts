import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RefreshJwtGuard } from '../common/guards/refresh-jwt.guard';
import { RegisterUserValidationPipe } from '../common/pipes/register-user-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authServcie: AuthService) {}

  @Post('register')
  async register(@Body(RegisterUserValidationPipe) dto: RegisterDto) {
    console.log('🚀 ~ AuthController ~ register ~ dto:', dto);
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
