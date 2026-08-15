import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PrescriptionMedicineDto } from './create-prescription.dto';

export class UpdatePrescriptionDto {
  @IsNumber()
  @IsOptional()
  chamberId?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tests?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionMedicineDto)
  medicines?: PrescriptionMedicineDto[];
}
