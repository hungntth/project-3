import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const existing = await this.warehouseRepository.findOne({
      where: { name: createWarehouseDto.name },
    });
    if (existing) {
      throw new ConflictException('Kho đã tồn tại');
    }

    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return await this.warehouseRepository.save(warehouse);
  }

  async findAll(): Promise<Warehouse[]> {
    return await this.warehouseRepository.find({
      order: { name: 'ASC' },
    });
  }
}
