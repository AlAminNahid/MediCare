import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Chamber } from '../entities/chamber.entity';
import { Prescription } from '../entities/prescription.entity';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Chamber) private chamberRepo: Repository<Chamber>,
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

  getChambers(doctorId: number) {
    return this.chamberRepo.find({ where: { doctorId } });
  }

  async bookAppointment(patientId: number, dto: BookAppointmentDto) {
    const chamber = await this.chamberRepo.findOne({ where: { chamberId: dto.chamberId } });
    if (!chamber) throw new NotFoundException('Chamber not found');

    // Retry on unique-constraint conflict to avoid duplicate serial numbers
    // when two patients book the same chamber/date at the same time.
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await this.appointmentRepo.count({
        where: { chamberId: chamber.chamberId, date: dto.date },
      });
      const appointment = this.appointmentRepo.create({
        chamberId: chamber.chamberId,
        doctorId: chamber.doctorId,
        patientId,
        date: dto.date,
        serialNumber: existing + 1,
        reason: dto.reason,
        status: AppointmentStatus.WAITING,
      });
      try {
        return await this.appointmentRepo.save(appointment);
      } catch (err) {
        if (err instanceof QueryFailedError && attempt < 4) continue;
        throw err;
      }
    }
  }

  getAppointments(patientId: number) {
    return this.appointmentRepo.find({
      where: { patientId },
      relations: { doctor: true, chamber: true },
      order: { date: 'DESC', serialNumber: 'ASC' },
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
