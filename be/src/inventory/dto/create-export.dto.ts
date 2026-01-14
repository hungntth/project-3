import { IsNumber, IsNotEmpty, IsString, IsOptional, Min } from 'class-validator';

export class CreateExportDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
