import { IsString, IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
