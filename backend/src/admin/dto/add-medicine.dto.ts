import { IsString } from 'class-validator';

export class AddMedicineDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  strength: string;

  @IsString()
  manufacturerName: string;
}
