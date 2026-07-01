import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChamberController } from './chamber.controller';
import { ChamberService } from './chamber.service';
import { Chamber } from '../entities/chamber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chamber])],
  controllers: [ChamberController],
  providers: [ChamberService],
  exports: [TypeOrmModule],
})
export class ChamberModule {}
