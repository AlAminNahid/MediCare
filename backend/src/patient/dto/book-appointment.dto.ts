import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class BookAppointmentDto {
  @IsNumber()
  doctorId: number;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
