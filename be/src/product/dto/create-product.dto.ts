import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsInt, Max } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsOptional()
  code?: string; // Mã hàng (tự động sinh nếu không nhập)

  @IsString()
  @IsNotEmpty()
  name: string; // Tên hàng

  @IsNumber()
  @IsOptional()
  categoryId?: number; // Nhóm hàng

  @IsNumber()
  @IsOptional()
  brandId?: number; // Thương hiệu

  @IsNumber()
  @Min(0, { message: 'Giá bán phải lớn hơn hoặc bằng 0' })
  @IsNotEmpty({ message: 'Giá bán là bắt buộc' })
  price: number; // Giá bán (bắt buộc)

  @IsNumber()
  @IsOptional()
  warehouseId?: number; // Kho

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number; // Trọng lượng

  @IsString()
  @IsOptional()
  weightUnit?: string; // Đơn vị trọng lượng (g hoặc kg)

  @IsString()
  @IsOptional()
  description?: string; // Mô tả (HTML)

  @IsString()
  @IsOptional()
  unit?: string; // Đơn vị tính (giữ lại để tương thích)

  @IsString()
  @IsOptional()
  images?: string; // JSON array chứa đường dẫn ảnh

  @IsInt({ message: 'Số dư đầu kỳ phải là số nguyên' })
  @Min(1, { message: 'Số dư đầu kỳ phải là số nguyên dương' })
  @IsNotEmpty({ message: 'Số dư đầu kỳ là bắt buộc' })
  openingBalance: number;

  @IsInt({ message: 'Thời gian bảo hành phải là số nguyên' })
  @Min(1, { message: 'Thời gian bảo hành tối thiểu là 1 tháng' })
  @Max(24, { message: 'Thời gian bảo hành tối đa là 24 tháng (2 năm)' })
  @IsOptional()
  warrantyPeriod?: number; // Thời gian bảo hành (tháng, từ 1-24)
}
