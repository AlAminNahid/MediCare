import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Chamber } from '../entities/chamber.entity';
import { Prescription } from '../entities/prescription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Appointment, Doctor, Chamber, Prescription]),
  ],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
