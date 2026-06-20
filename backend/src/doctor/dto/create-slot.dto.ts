import { IsArray, IsEnum, IsString } from 'class-validator';
import { DayOfWeek } from '../../entities/appointment-slot.entity';

export class CreateSlotDto {
  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  days: DayOfWeek[];
}
