import 'dotenv/config';
import { DataSource } from 'typeorm';

import { Admin } from './entities/admin.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { Login } from './entities/login.entity';
import { Appointment } from './entities/appointment.entity';
import { Chamber } from './entities/chamber.entity';
import { Backup } from './entities/backup.entity';
import { Medicine } from './entities/medicine.entity';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionMedicine } from './entities/prescription_medicine.entity';
import { Feedback } from './entities/feedback.entity';

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource(databaseUrl ? {
  type: 'postgres',
  url: databaseUrl,
  ssl: { rejectUnauthorized: false },
  entities: [
    Admin,
    Doctor,
    Patient,
    Login,
    Appointment,
    Chamber,
    Backup,
    Medicine,
    Prescription,
    PrescriptionMedicine,
    Feedback,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
} : {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'chamber_management_system',
  entities: [
    Admin,
    Doctor,
    Patient,
    Login,
    Appointment,
    Chamber,
    Backup,
    Medicine,
    Prescription,
    PrescriptionMedicine,
    Feedback,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
