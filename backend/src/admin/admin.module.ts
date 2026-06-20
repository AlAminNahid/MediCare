import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from '../entities/admin.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { Medicine } from '../entities/medicine.entity';
import { Backup } from '../entities/backup.entity';
import { Login } from '../entities/login.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      Doctor,
      Patient,
      Appointment,
      Medicine,
      Backup,
      Login,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
