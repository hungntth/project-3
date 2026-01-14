import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Product } from '../product/entities/product.entity';
import { Category } from '../product/entities/category.entity';
import { Brand } from '../product/entities/brand.entity';
import { Warehouse } from '../product/entities/warehouse.entity';
import { Customer } from '../order/entities/customer.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { Import } from '../inventory/entities/import.entity';
import { Export } from '../inventory/entities/export.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      Warehouse,
      Customer,
      Order,
      OrderItem,
      Import,
      Export,
      User,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
