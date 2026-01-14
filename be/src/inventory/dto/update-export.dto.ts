import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateExportDto {
  @IsNumber()
  @IsOptional()
  productId?: number;

  @IsNumber()
  @IsOptional()
  @Min(0.01)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
