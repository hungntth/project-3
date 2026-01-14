import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(
      createUserDto.username,
      createUserDto.password,
      createUserDto.role || UserRole.USER,
      createUserDto.fullName,
      createUserDto.email,
      createUserDto.phone,
      createUserDto.position,
      createUserDto.department,
    );
    const { password, ...result } = user;
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.userService.findAll();
    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    await this.userService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
    return { message: 'Đổi mật khẩu thành công' };
  }
}
