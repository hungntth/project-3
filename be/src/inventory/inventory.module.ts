import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Import } from './entities/import.entity';
import { Export } from './entities/export.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Import, Export]),
    ProductModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
