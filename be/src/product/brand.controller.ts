import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.brandService.create(createBrandDto);
  }

  @Get()
  async findAll() {
    return await this.brandService.findAll();
  }
}
