import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { JWTPayload } from '../../auth/types/jwt-payload';
import { PrismaService } from '../../prisma/prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService, 
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ){}


  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
      
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    
    return await this.validateJwtToken(token, request)
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : undefined
  }

  private async validateJwtToken(token: string, request: Request) {
    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(token, {
        secret: this.config.getOrThrow<string>('REFRESH_JWT_SECRET')
      })

      const user = await this.prisma.user.findUnique({
        where: { email: payload.email }
      })

      if (!user || user.refreshToken === null) {
        throw new UnauthorizedException('Authentication failed: invalid refresh token')
      }

      const isRefreshTokenValid = await bcrypt.compare(token, (user.refreshToken as string));
      console.log("🚀 ~ RefreshJwtGuard ~ validateJwtToken ~ isRefreshTokenValid:", isRefreshTokenValid)
      if (isRefreshTokenValid) {
        request['user'] = {
          id: payload.sub,
          email: payload.email      
        }
  
        return true
      }

      throw new UnauthorizedException('Invalid refresh token');

      
    } catch (error) {
      console.log("🚀 ~ RefreshJwtGuard ~ validateJwtToken ~ error:", error)
      const err = error as Error;
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('refresh token expired');
      } else if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}
