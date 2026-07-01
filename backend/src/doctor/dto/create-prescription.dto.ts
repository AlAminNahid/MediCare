import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PrescriptionMedicineDto {
  @IsString()
  medicineName: string;

  @IsString()
  dosage: string;

  @IsString()
  duration: string;
}

export class CreatePrescriptionDto {
  @IsNumber()
  patientId: number;

  @IsNumber()
  @IsOptional()
  chamberId?: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionMedicineDto)
  medicines: PrescriptionMedicineDto[];
}
