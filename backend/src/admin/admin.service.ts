import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../entities/admin.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { Chamber } from '../entities/chamber.entity';
import { Medicine } from '../entities/medicine.entity';
import { Backup } from '../entities/backup.entity';
import { Login } from '../entities/login.entity';
import { Feedback, FeedbackStatus } from '../entities/feedback.entity';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { AddMedicineDto } from './dto/add-medicine.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Chamber) private chamberRepo: Repository<Chamber>,
    @InjectRepository(Medicine) private medicineRepo: Repository<Medicine>,
    @InjectRepository(Backup) private backupRepo: Repository<Backup>,
    @InjectRepository(Login) private loginRepo: Repository<Login>,
    @InjectRepository(Feedback) private feedbackRepo: Repository<Feedback>,
    private dataSource: DataSource,
  ) {}

  // Dashboard stats
  async getDashboardStats() {
    const [totalDoctors, totalPatients, totalChambers, totalAppointments, totalMedicines] =
      await Promise.all([
        this.doctorRepo.count(),
        this.patientRepo.count(),
        this.chamberRepo.count(),
        this.appointmentRepo.count(),
        this.medicineRepo.count(),
      ]);

    return { totalDoctors, totalPatients, totalChambers, totalAppointments, totalMedicines };
  }

  // Admin profile
  async getAdminInfo(adminId: number) {
    const admin = await this.adminRepo.findOne({ where: { adminId } });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async updateAdminProfile(adminId: number, dto: UpdateAdminProfileDto) {
    const admin = await this.adminRepo.findOne({ where: { adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    if (dto.fullName !== undefined) admin.fullName = dto.fullName;
    if (dto.email !== undefined) admin.email = dto.email;
    if (dto.phoneNumber !== undefined) admin.phoneNumber = dto.phoneNumber;
    await this.adminRepo.save(admin);

    const login = await this.loginRepo.findOne({ where: { adminId } });
    if (login) {
      if (dto.email !== undefined) login.email = dto.email;
      if (dto.password) login.password = await bcrypt.hash(dto.password, 10);
      await this.loginRepo.save(login);
    }

    return { message: 'Profile updated successfully' };
  }

  // Doctors (read-only oversight)
  getDoctors() {
    return this.doctorRepo.find();
  }

  // Patients (read-only oversight)
  getPatients() {
    return this.patientRepo.find();
  }

  // Appointments (read-only oversight)
  getAppointments() {
    return this.appointmentRepo.find({
      relations: { doctor: true, patient: true, chamber: true },
    });
  }

  // Medicines (reference list)
  getMedicines() {
    return this.medicineRepo.find();
  }

  async addMedicine(dto: AddMedicineDto) {
    const medicine = this.medicineRepo.create(dto);
    return this.medicineRepo.save(medicine);
  }

  async deleteMedicine(medicineId: number) {
    const medicine = await this.medicineRepo.findOne({ where: { medicineId } });
    if (!medicine) throw new NotFoundException('Medicine not found');
    await this.medicineRepo.remove(medicine);
    return { message: 'Medicine deleted' };
  }

  // Backups
  getBackups() {
    return this.backupRepo.find({ order: { backupId: 'DESC' } });
  }

  async insertBackup(fileName: string, createdBy: string) {
    const backup = this.backupRepo.create({ fileName, createdBy });
    return this.backupRepo.save(backup);
  }

  async deleteBackup(backupId: number) {
    const backup = await this.backupRepo.findOne({ where: { backupId } });
    if (!backup) throw new NotFoundException('Backup not found');
    await this.backupRepo.remove(backup);
    return { message: 'Backup deleted' };
  }

  getFeedbacks() {
    return this.feedbackRepo.find({
      relations: { doctor: true, patient: true },
      order: { createdAt: 'DESC' },
    });
  }

  async markFeedbackReviewed(feedbackId: number) {
    const fb = await this.feedbackRepo.findOne({ where: { feedbackId } });
    if (!fb) throw new NotFoundException('Feedback not found');
    fb.status = FeedbackStatus.REVIEWED;
    return this.feedbackRepo.save(fb);
  }

  async generateSqlDump(): Promise<string> {
    const tables = [
      'login',
      'admin',
      'doctor',
      'patient',
      'chamber',
      'appointment',
      'medicine',
      'prescription',
      'backup',
    ];

    const lines: string[] = [
      '-- MediCare Database Backup',
      `-- Generated: ${new Date().toISOString()}`,
      '--',
      'SET client_encoding = \'UTF8\';',
      'SET standard_conforming_strings = on;',
      '',
    ];

    for (const table of tables) {
      const rows: Record<string, unknown>[] = await this.dataSource.query(
        `SELECT * FROM "${table}"`,
      ).catch(() => []);

      if (rows.length === 0) continue;

      lines.push(`-- Table: ${table}`);
      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `"${c}"`).join(', ');

      for (const row of rows) {
        const values = columns.map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return String(val);
          // escape single quotes in strings
          return `'${String(val).replace(/'/g, "''")}'`;
        }).join(', ');
        lines.push(`INSERT INTO "${table}" (${colList}) VALUES (${values});`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
