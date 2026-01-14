import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Username hoặc password không đúng');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return await this.authService.refreshAccessToken(
        refreshTokenDto.refresh_token,
      );
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Refresh token không hợp lệ',
      );
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.logout(refreshTokenDto.refresh_token);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Request() req) {
    return await this.authService.logoutAll(req.user.id);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Request() req) {
    return {
      valid: true,
      user: req.user,
    };
  }
}
