import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePatientProfileDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
