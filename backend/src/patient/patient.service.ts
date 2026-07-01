import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Patient } from '../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Chamber } from '../entities/chamber.entity';
import { Prescription } from '../entities/prescription.entity';
import { Login } from '../entities/login.entity';
import { Feedback, FeedbackSenderRole } from '../entities/feedback.entity';
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
    @InjectRepository(Login) private loginRepo: Repository<Login>,
    @InjectRepository(Feedback) private feedbackRepo: Repository<Feedback>,
  ) {}

  async getPatientInfo(patientId: number) {
    const patient = await this.patientRepo.findOne({ where: { patientId } });
    if (!patient) throw new NotFoundException('Patient not found');
    const login = await this.loginRepo.findOne({ where: { patientId } });
    return { ...patient, email: login?.email ?? '' };
  }

  async updatePatientProfile(patientId: number, dto: UpdatePatientProfileDto) {
    const patient = await this.patientRepo.findOne({ where: { patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const { password, email, ...profileFields } = dto;
    Object.assign(patient, profileFields);
    await this.patientRepo.save(patient);

    const login = await this.loginRepo.findOne({ where: { patientId } });
    if (login) {
      if (email !== undefined) login.email = email;
      if (password) login.password = await bcrypt.hash(password, 10);
      await this.loginRepo.save(login);
    }

    return { message: 'Profile updated successfully' };
  }

  getDoctors(location?: string) {
    if (!location) {
      return this.doctorRepo.find({ order: { fullName: 'ASC' } });
    }
    return this.doctorRepo
      .createQueryBuilder('d')
      .innerJoin('d.chambers', 'c')
      .where('c.address ILIKE :loc', { loc: `%${location}%` })
      .orWhere('c.name ILIKE :loc', { loc: `%${location}%` })
      .orderBy('d.fullName', 'ASC')
      .getMany();
  }

  getChambers(doctorId: number) {
    return this.chamberRepo.find({ where: { doctorId } });
  }

  async bookAppointment(patientId: number, dto: BookAppointmentDto) {
    const chamber = await this.chamberRepo.findOne({ where: { chamberId: dto.chamberId } });
    if (!chamber) throw new NotFoundException('Chamber not found');

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
      relations: { doctor: true, chamber: true, medicines: true },
      order: { date: 'DESC' },
    });
  }

  async submitFeedback(patientId: number, dto: { subject: string; message: string }) {
    const feedback = this.feedbackRepo.create({
      senderRole: FeedbackSenderRole.PATIENT,
      patientId,
      subject: dto.subject,
      message: dto.message,
    });
    return this.feedbackRepo.save(feedback);
  }
}
