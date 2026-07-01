import { IsArray, IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  visitFee?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  degrees?: string[];

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
