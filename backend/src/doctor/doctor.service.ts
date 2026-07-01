import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionMedicine } from '../entities/prescription_medicine.entity';
import { Medicine } from '../entities/medicine.entity';
import { Login } from '../entities/login.entity';
import { Feedback, FeedbackSenderRole } from '../entities/feedback.entity';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Prescription) private prescriptionRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionMedicine) private prescriptionMedicineRepo: Repository<PrescriptionMedicine>,
    @InjectRepository(Medicine) private medicineRepo: Repository<Medicine>,
    @InjectRepository(Login) private loginRepo: Repository<Login>,
    @InjectRepository(Feedback) private feedbackRepo: Repository<Feedback>,
  ) {}

  async getDoctorInfo(doctorId: number) {
    const doctor = await this.doctorRepo.findOne({ where: { doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    const login = await this.loginRepo.findOne({ where: { doctorId } });
    return { ...doctor, email: login?.email ?? '' };
  }

  async updateDoctorProfile(doctorId: number, dto: UpdateDoctorProfileDto) {
    const doctor = await this.doctorRepo.findOne({ where: { doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (dto.fullName !== undefined) doctor.fullName = dto.fullName;
    if (dto.phoneNumber !== undefined) doctor.phoneNumber = dto.phoneNumber;
    if (dto.specialization !== undefined) doctor.specialization = dto.specialization;
    if (dto.visitFee !== undefined) doctor.visitFee = dto.visitFee;
    if (dto.degrees !== undefined) doctor.degrees = dto.degrees;
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
      .innerJoin('a.patient', 'p')
      .where('a.doctorId = :doctorId', { doctorId })
      .getRawMany();
  }

  getMedicines(search?: string) {
    if (search) {
      return this.medicineRepo.find({
        where: { name: ILike(`%${search}%`) },
        take: 10,
        order: { name: 'ASC' },
      });
    }
    return this.medicineRepo.find({ order: { name: 'ASC' } });
  }

  async createPrescription(doctorId: number, dto: CreatePrescriptionDto) {
    const prescription = this.prescriptionRepo.create({
      doctorId,
      patientId: dto.patientId,
      chamberId: dto.chamberId,
      date: dto.date,
      notes: dto.notes,
    });
    const saved = await this.prescriptionRepo.save(prescription);

    const medicines = dto.medicines.map((m) =>
      this.prescriptionMedicineRepo.create({
        prescriptionId: saved.prescriptionId,
        medicineName: m.medicineName,
        dosage: m.dosage,
        duration: m.duration,
      }),
    );
    await this.prescriptionMedicineRepo.save(medicines);

    return saved;
  }

  getPrescriptions(doctorId: number) {
    return this.prescriptionRepo.find({
      where: { doctorId },
      relations: { patient: true, chamber: true, medicines: true },
      order: { date: 'DESC' },
    });
  }

  async submitFeedback(doctorId: number, dto: { subject: string; message: string }) {
    const feedback = this.feedbackRepo.create({
      senderRole: FeedbackSenderRole.DOCTOR,
      doctorId,
      subject: dto.subject,
      message: dto.message,
    });
    return this.feedbackRepo.save(feedback);
  }
}
