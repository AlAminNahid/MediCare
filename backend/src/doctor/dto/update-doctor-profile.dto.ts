import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  specialization: string;

  @IsNumber()
  visitFee: number;

  @IsString()
  @MinLength(6)
  password: string;
}
