import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';

@Controller('warehouses')
@UseGuards(JwtAuthGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return await this.warehouseService.create(createWarehouseDto);
  }

  @Get()
  async findAll() {
    return await this.warehouseService.findAll();
  }
}
