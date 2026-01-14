import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from './entities/customer.entity';
import { Product } from '../product/entities/product.entity';
import { OrderService } from './order.service';
import { CustomerService } from './customer.service';
import { OrderController } from './order.controller';
import { CustomerController } from './customer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Customer, Product]),
  ],
  controllers: [OrderController, CustomerController],
  providers: [OrderService, CustomerService],
  exports: [OrderService, CustomerService],
})
export class OrderModule {}
