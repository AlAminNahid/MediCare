import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentSlot } from '../entities/appointment-slot.entity';
import { Prescription } from '../entities/prescription.entity';
import { Medicine } from '../entities/medicine.entity';
import { Login } from '../entities/login.entity';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(AppointmentSlot) private slotRepo: Repository<AppointmentSlot>,
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

    doctor.fullName = dto.fullName;
    doctor.phoneNumber = dto.phoneNumber;
    doctor.specialization = dto.specialization;
    doctor.visitFee = dto.visitFee;
    await this.doctorRepo.save(doctor);

    const login = await this.loginRepo.findOne({ where: { doctorId } });
    if (login) {
      login.email = dto.email;
      login.password = await bcrypt.hash(dto.password, 10);
      await this.loginRepo.save(login);
    }

    return { message: 'Profile updated successfully' };
  }

  getAppointments(doctorId: number) {
    return this.appointmentRepo.find({
      where: { doctorId },
      relations: { patient: true },
    });
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
    return this.medicineRepo.find({ where: { status: 'Active' as any } });
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

  getSlots(doctorId: number) {
    return this.slotRepo.find({ where: { doctorId } });
  }

  async createSlot(doctorId: number, dto: CreateSlotDto) {
    const slot = this.slotRepo.create({ ...dto, doctorId });
    return this.slotRepo.save(slot);
  }

  async deleteSlot(slotId: number, doctorId: number) {
    const slot = await this.slotRepo.findOne({ where: { slotId, doctorId } });
    if (!slot) throw new NotFoundException('Slot not found');
    await this.slotRepo.remove(slot);
    return { message: 'Slot deleted' };
  }
}
