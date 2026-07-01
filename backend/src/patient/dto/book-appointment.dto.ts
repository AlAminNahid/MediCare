import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class BookAppointmentDto {
  @IsNumber()
  chamberId: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
