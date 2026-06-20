import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentSlot } from '../entities/appointment-slot.entity';
import { Prescription } from '../entities/prescription.entity';
import { Medicine } from '../entities/medicine.entity';
import { Login } from '../entities/login.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      Patient,
      Appointment,
      AppointmentSlot,
      Prescription,
      Medicine,
      Login,
    ]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
