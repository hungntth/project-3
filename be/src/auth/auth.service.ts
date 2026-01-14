import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await this.userService.validatePassword(user, password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    
    // Tạo access token (15 phút)
    const access_token = this.jwtService.sign(payload);
    
    // Tạo refresh token (7 ngày)
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

    // Lưu refresh token vào database
    await this.refreshTokenRepository.save({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      access_token,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    // Tìm refresh token trong database
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    // Kiểm tra token đã hết hạn chưa
    if (new Date() > tokenRecord.expiresAt) {
      // Xóa token hết hạn
      await this.refreshTokenRepository.remove(tokenRecord);
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    const user = tokenRecord.user;
    const payload = { username: user.username, sub: user.id, role: user.role };
    
    // Tạo access token mới
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async logout(refreshToken: string) {
    // Xóa refresh token khỏi database
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (tokenRecord) {
      await this.refreshTokenRepository.remove(tokenRecord);
    }

    return { message: 'Đăng xuất thành công' };
  }

  async logoutAll(userId: number) {
    // Xóa tất cả refresh tokens của user
    await this.refreshTokenRepository.delete({ userId });
    return { message: 'Đã đăng xuất khỏi tất cả thiết bị' };
  }

  async validateUserById(id: number): Promise<User | null> {
    return await this.userService.findById(id);
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // Dọn dẹp refresh tokens hết hạn (có thể gọi định kỳ)
  async cleanupExpiredTokens() {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
