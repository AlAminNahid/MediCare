import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DataSource, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
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
import { UpdateMedicineDto } from './dto/update-medicine.dto';

export interface ExternalMedicineSuggestion {
  name: string;
  generic: string;
  company: string;
  dosage: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Chamber) private chamberRepo: Repository<Chamber>,
    @InjectRepository(Medicine) private medicineRepo: Repository<Medicine>,
    @InjectRepository(Backup) private backupRepo: Repository<Backup>,
    @InjectRepository(Login) private loginRepo: Repository<Login>,
    @InjectRepository(Feedback) private feedbackRepo: Repository<Feedback>,
    private dataSource: DataSource,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  private externalMedicineCache = new Map<
    string,
    { data: ExternalMedicineSuggestion[]; expiresAt: number }
  >();

  // Dashboard stats
  async getDashboardStats() {
    const [
      totalDoctors,
      totalPatients,
      totalChambers,
      totalAppointments,
      totalMedicines,
      recentAppointments,
      trendRows,
    ] = await Promise.all([
      this.doctorRepo.count(),
      this.patientRepo.count(),
      this.chamberRepo.count(),
      this.appointmentRepo.count(),
      this.medicineRepo.count(),
      this.appointmentRepo.find({
        relations: { doctor: true, patient: true, chamber: true },
        order: { date: 'DESC', serialNumber: 'DESC' },
        take: 10,
      }),
      this.getAppointmentTrendRows(),
    ]);

    const appointmentTrend = this.fillTrendGaps(trendRows);

    return {
      totalDoctors,
      totalPatients,
      totalChambers,
      totalAppointments,
      totalMedicines,
      recentAppointments,
      appointmentTrend,
    };
  }

  private getAppointmentTrendRows(): Promise<
    { date: string; count: string }[]
  > {
    const start = new Date();
    start.setDate(start.getDate() - 13);
    const startDate = start.toISOString().slice(0, 10);

    return this.appointmentRepo
      .createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('a.date >= :start', { start: startDate })
      .groupBy('a.date')
      .orderBy('a.date', 'ASC')
      .getRawMany();
  }

  private fillTrendGaps(rows: { date: string; count: string }[]) {
    const counts = new Map(rows.map((r) => [r.date, Number(r.count)]));
    const days: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      days.push({ date, count: counts.get(date) ?? 0 });
    }
    return days;
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

  async updateMedicine(medicineId: number, dto: UpdateMedicineDto) {
    const medicine = await this.medicineRepo.findOne({ where: { medicineId } });
    if (!medicine) throw new NotFoundException('Medicine not found');

    if (dto.name !== undefined) medicine.name = dto.name;
    if (dto.type !== undefined) medicine.type = dto.type;
    if (dto.strength !== undefined) medicine.strength = dto.strength;
    if (dto.manufacturerName !== undefined) medicine.manufacturerName = dto.manufacturerName;

    return this.medicineRepo.save(medicine);
  }

  async deleteMedicine(medicineId: number) {
    const medicine = await this.medicineRepo.findOne({ where: { medicineId } });
    if (!medicine) throw new NotFoundException('Medicine not found');
    await this.medicineRepo.remove(medicine);
    return { message: 'Medicine deleted' };
  }

  // External medicine lookup (search-and-prefill only, never authoritative)
  async searchExternalMedicines(query: string): Promise<ExternalMedicineSuggestion[]> {
    const q = query.trim();
    if (q.length < 3) return [];

    const cacheKey = q.toLowerCase();
    const cached = this.externalMedicineCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const apiUrl = this.configService.get<string>('MEDICINE_API_URL');
    const apiKey = this.configService.get<string>('MEDICINE_API_KEY');
    if (!apiUrl || !apiKey) return [];

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/api/medicines/search`, {
          params: { q },
          headers: { 'X-API-Key': apiKey },
          timeout: 5000,
        }),
      );

      const results: ExternalMedicineSuggestion[] = (response.data?.data ?? [])
        .slice(0, 5)
        .map((item: Record<string, unknown>) => ({
          name: String(item.name ?? ''),
          generic: String(item.generic ?? ''),
          company: String(item.company ?? ''),
          dosage: String(item.dosage ?? ''),
        }));

      this.externalMedicineCache.set(cacheKey, {
        data: results,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return results;
    } catch {
      return [];
    }
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
      "SET client_encoding = 'UTF8';",
      'SET standard_conforming_strings = on;',
      '',
    ];

    for (const table of tables) {
      const rows: Record<string, unknown>[] = await this.dataSource
        .query(`SELECT * FROM "${table}"`)
        .catch(() => []);

      if (rows.length === 0) continue;

      lines.push(`-- Table: ${table}`);
      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `"${c}"`).join(', ');

      for (const row of rows) {
        const values = columns
          .map((col) => {
            const val = row[col];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean')
              return String(val);
            // escape single quotes in strings
            return `'${String(val).replace(/'/g, "''")}'`;
          })
          .join(', ');
        lines.push(`INSERT INTO "${table}" (${colList}) VALUES (${values});`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
