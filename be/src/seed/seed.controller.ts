import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('seed')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('clear')
  async clearData() {
    await this.seedService.clearAllData();
    return { message: 'Đã xóa tất cả dữ liệu' };
  }

  @Post('run')
  async seedData() {
    await this.seedService.seedData();
    return { message: 'Đã seed dữ liệu mẫu thành công' };
  }

  @Post('reset')
  async resetData() {
    await this.seedService.clearAllData();
    await this.seedService.seedData();
    return { message: 'Đã reset và seed dữ liệu mẫu thành công' };
  }
}
