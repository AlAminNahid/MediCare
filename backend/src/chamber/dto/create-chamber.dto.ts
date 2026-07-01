import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DayOfWeek } from '../../entities/chamber.entity';

export class CreateChamberDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  days: DayOfWeek[];

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  visitFee?: number;
}
