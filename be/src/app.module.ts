import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';
import { SeedModule } from './seed/seed.module';
import { User } from './user/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { Product } from './product/entities/product.entity';
import { Category } from './product/entities/category.entity';
import { Brand } from './product/entities/brand.entity';
import { Warehouse } from './product/entities/warehouse.entity';
import { Import } from './inventory/entities/import.entity';
import { Export } from './inventory/entities/export.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Customer } from './order/entities/customer.entity';
import { UserService } from './user/user.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, RefreshToken, Product, Import, Export, Category, Brand, Warehouse, Order, OrderItem, Customer],
      synchronize: true, // Chỉ dùng trong development, không dùng trong production
    }),
    UserModule,
    AuthModule,
    ProductModule,
    InventoryModule,
    OrderModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private userService: UserService) {}

  async onModuleInit() {
    // Tự động tạo tài khoản admin nếu chưa có
    await this.userService.createAdminIfNotExists();
  }
}
