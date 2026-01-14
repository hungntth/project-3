import { IsNumber, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
