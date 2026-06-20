import { IsNumber, IsString } from 'class-validator';

export class EditDoctorDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  specialization: string;

  @IsNumber()
  visitFee: number;
}
