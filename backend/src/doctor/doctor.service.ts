import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Prescription } from '../entities/prescription.entity';
import { Medicine } from '../entities/medicine.entity';
import { Login } from '../entities/login.entity';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Prescription) private prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Medicine) private medicineRepo: Repository<Medicine>,
    @InjectRepository(Login) private loginRepo: Repository<Login>,
  ) {}

  async getDoctorInfo(doctorId: number) {
    const doctor = await this.doctorRepo.findOne({ where: { doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async updateDoctorProfile(doctorId: number, dto: UpdateDoctorProfileDto) {
    const doctor = await this.doctorRepo.findOne({ where: { doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (dto.fullName !== undefined) doctor.fullName = dto.fullName;
    if (dto.phoneNumber !== undefined) doctor.phoneNumber = dto.phoneNumber;
    if (dto.specialization !== undefined) doctor.specialization = dto.specialization;
    if (dto.visitFee !== undefined) doctor.visitFee = dto.visitFee;
    await this.doctorRepo.save(doctor);

    const login = await this.loginRepo.findOne({ where: { doctorId } });
    if (login) {
      if (dto.email !== undefined) login.email = dto.email;
      if (dto.password) login.password = await bcrypt.hash(dto.password, 10);
      await this.loginRepo.save(login);
    }

    return { message: 'Profile updated successfully' };
  }

  getAppointments(doctorId: number, chamberId?: number, date?: string) {
    return this.appointmentRepo.find({
      where: {
        doctorId,
        ...(chamberId !== undefined && { chamberId }),
        ...(date !== undefined && { date }),
      },
      relations: { patient: true, chamber: true },
      order: { serialNumber: 'ASC' },
    });
  }

  async updateAppointment(
    doctorId: number,
    appointmentId: number,
    dto: { status?: AppointmentStatus; reason?: string },
  ) {
    const appointment = await this.appointmentRepo.findOne({ where: { appointmentId, doctorId } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (dto.status !== undefined) appointment.status = dto.status;
    if (dto.reason !== undefined) appointment.reason = dto.reason;
    return this.appointmentRepo.save(appointment);
  }

  getPatients(doctorId: number) {
    return this.appointmentRepo
      .createQueryBuilder('a')
      .select('DISTINCT p.*')
      .leftJoin('a.patient', 'p')
      .where('a.doctorId = :doctorId', { doctorId })
      .getRawMany();
  }

  getMedicines() {
    return this.medicineRepo.find();
  }

  async createPrescription(doctorId: number, dto: CreatePrescriptionDto) {
    const prescription = this.prescriptionRepo.create({ ...dto, doctorId });
    return this.prescriptionRepo.save(prescription);
  }

  getPrescriptions(doctorId: number) {
    return this.prescriptionRepo.find({
      where: { doctorId },
      relations: { patient: true, medicine: true },
    });
  }
}
