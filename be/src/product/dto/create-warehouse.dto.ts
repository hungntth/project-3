import { IsString, IsNotEmpty } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
