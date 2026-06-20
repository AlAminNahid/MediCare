import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsNumber()
  patientId: number;

  @IsNumber()
  medicineId: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  additionalNotes?: string;

  @IsString()
  dosage: string;

  @IsString()
  duration: string;
}
