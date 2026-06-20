import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditPatientDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsNumber()
  age: number;

  @IsString()
  gender: string;

  @IsString()
  address: string;
}
