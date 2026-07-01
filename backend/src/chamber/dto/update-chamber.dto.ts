import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DayOfWeek } from '../../entities/chamber.entity';

export class UpdateChamberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  days?: DayOfWeek[];

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  visitFee?: number;
}
