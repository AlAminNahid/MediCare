import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MedicineStatus } from '../../entities/medicine.entity';

export class AddMedicineDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  strength: string;

  @IsString()
  manufacturerName: string;

  @IsOptional()
  @IsEnum(MedicineStatus)
  status?: MedicineStatus;
}
