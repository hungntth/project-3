import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Tên khách hàng

  @IsString()
  @IsOptional()
  phone?: string; // Số điện thoại
}
