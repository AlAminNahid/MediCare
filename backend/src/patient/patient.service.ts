import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Prescription } from '../entities/prescription.entity';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Prescription) private prescriptionRepo: Repository<Prescription>,
  ) {}

  async getPatientInfo(patientId: number) {
    const patient = await this.patientRepo.findOne({ where: { patientId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async updatePatientProfile(patientId: number, dto: UpdatePatientProfileDto) {
    const patient = await this.patientRepo.findOne({ where: { patientId } });
    if (!patient) throw new NotFoundException('Patient not found');
    Object.assign(patient, dto);
    return this.patientRepo.save(patient);
  }

  getDoctors() {
    return this.doctorRepo.find();
  }

  async bookAppointment(patientId: number, dto: BookAppointmentDto) {
    const appointment = this.appointmentRepo.create({
      ...dto,
      patientId,
      status: AppointmentStatus.BOOKED,
    });
    return this.appointmentRepo.save(appointment);
  }

  getAppointments(patientId: number) {
    return this.appointmentRepo.find({
      where: { patientId },
      relations: { doctor: true },
    });
  }

  async cancelAppointment(appointmentId: number, patientId: number) {
    const appt = await this.appointmentRepo.findOne({
      where: { appointmentId, patientId },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    appt.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appt);
  }

  getPrescriptions(patientId: number) {
    return this.prescriptionRepo.find({
      where: { patientId },
      relations: { doctor: true, medicine: true },
    });
  }
}
