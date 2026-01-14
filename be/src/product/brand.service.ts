import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const existing = await this.brandRepository.findOne({
      where: { name: createBrandDto.name },
    });
    if (existing) {
      throw new ConflictException('Thương hiệu đã tồn tại');
    }

    const brand = this.brandRepository.create(createBrandDto);
    return await this.brandRepository.save(brand);
  }

  async findAll(): Promise<Brand[]> {
    return await this.brandRepository.find({
      order: { name: 'ASC' },
    });
  }
}
