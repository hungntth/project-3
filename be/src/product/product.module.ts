import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Warehouse } from './entities/warehouse.entity';
import { ProductService } from './product.service';
import { UploadService } from './upload.service';
import { CategoryService } from './category.service';
import { BrandService } from './brand.service';
import { WarehouseService } from './warehouse.service';
import { ProductController } from './product.controller';
import { CategoryController } from './category.controller';
import { BrandController } from './brand.controller';
import { WarehouseController } from './warehouse.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Brand, Warehouse])],
  controllers: [ProductController, CategoryController, BrandController, WarehouseController],
  providers: [ProductService, UploadService, CategoryService, BrandService, WarehouseService],
  exports: [ProductService],
})
export class ProductModule {}
