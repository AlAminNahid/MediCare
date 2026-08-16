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

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
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
});
