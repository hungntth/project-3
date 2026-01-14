import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadService } from './upload.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private uploadService: UploadService,
  ) {}

  async generateProductCode(): Promise<string> {
    const count = await this.productRepository.count();
    const code = `SP${String(count + 1).padStart(6, '0')}`;
    
    // Kiểm tra code đã tồn tại chưa
    const existing = await this.productRepository.findOne({ where: { code } });
    if (existing) {
      // Nếu đã tồn tại, thử với timestamp
      return `SP${Date.now()}`;
    }
    
    return code;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Tự động sinh mã nếu không có
    let code = createProductDto.code;
    if (!code || code.trim() === '') {
      code = await this.generateProductCode();
    }

    // Kiểm tra mã đã tồn tại chưa
    const existingProduct = await this.productRepository.findOne({
      where: { code },
    });
    if (existingProduct) {
      throw new ConflictException('Mã sản phẩm đã tồn tại');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      code,
      openingBalance: createProductDto.openingBalance,
      currentBalance: createProductDto.openingBalance,
    });

    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: ['category', 'brand', 'warehouse'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand', 'warehouse'],
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    return product;
  }

  async updateBalance(id: number, quantity: number, type: 'import' | 'export'): Promise<void> {
    const product = await this.findOne(id);
    if (type === 'import') {
      product.currentBalance = Number(product.currentBalance) + Number(quantity);
    } else {
      if (Number(product.currentBalance) < Number(quantity)) {
        throw new ConflictException('Số lượng tồn kho không đủ');
      }
      product.currentBalance = Number(product.currentBalance) - Number(quantity);
    }
    await this.productRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    // Nếu có code mới và khác code cũ, kiểm tra trùng
    if (updateProductDto.code && updateProductDto.code !== product.code) {
      const existingProduct = await this.productRepository.findOne({
        where: { code: updateProductDto.code },
      });
      if (existingProduct) {
        throw new ConflictException('Mã sản phẩm đã tồn tại');
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    
    // Xóa ảnh nếu có
    if (product.images) {
      try {
        const imagePaths = JSON.parse(product.images);
        await this.uploadService.deleteFiles(imagePaths);
      } catch (e) {
        // Ignore error if images is not valid JSON
      }
    }
    
    await this.productRepository.remove(product);
  }
}
