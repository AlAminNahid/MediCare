import { IsEnum, IsString } from 'class-validator';
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

  @IsEnum(MedicineStatus)
  status: MedicineStatus;
}
