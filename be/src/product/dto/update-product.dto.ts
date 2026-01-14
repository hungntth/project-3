import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsInt, Max } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  brandId?: number;

  @IsNumber()
  @Min(0, { message: 'Giá bán phải lớn hơn hoặc bằng 0' })
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  warehouseId?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  images?: string;

  @IsInt({ message: 'Số dư đầu kỳ phải là số nguyên' })
  @Min(1, { message: 'Số dư đầu kỳ phải là số nguyên dương' })
  @IsOptional()
  openingBalance?: number;

  @IsInt({ message: 'Thời gian bảo hành phải là số nguyên' })
  @Min(1, { message: 'Thời gian bảo hành tối thiểu là 1 tháng' })
  @Max(24, { message: 'Thời gian bảo hành tối đa là 24 tháng (2 năm)' })
  @IsOptional()
  warrantyPeriod?: number; // Thời gian bảo hành (tháng, từ 1-24)
}
