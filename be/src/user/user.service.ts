import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    username: string,
    password: string,
    role: UserRole = UserRole.USER,
    fullName?: string,
    email?: string,
    phone?: string,
    position?: string,
    department?: string,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username đã tồn tại');
    }

    if (email) {
      const existingEmail = await this.userRepository.findOne({ where: { email } });
      if (existingEmail) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      role,
      fullName,
      email,
      phone,
      position,
      department,
    });

    return await this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await this.validatePassword(user, currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu
    user.password = hashedNewPassword;
    await this.userRepository.save(user);
  }

  async createAdminIfNotExists(): Promise<void> {
    const admin = await this.userRepository.findOne({
      where: { username: 'admin', role: UserRole.ADMIN },
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await this.userRepository.save({
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      console.log('Đã tạo tài khoản admin mặc định (username: admin, password: admin)');
    }
  }
}
