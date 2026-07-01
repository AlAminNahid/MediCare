import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { ChamberModule } from './chamber/chamber.module';

// Entities
import { Admin } from './entities/admin.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { Login } from './entities/login.entity';
import { Appointment } from './entities/appointment.entity';
import { Chamber } from './entities/chamber.entity';
import { Backup } from './entities/backup.entity';
import { Medicine } from './entities/medicine.entity';
import { Prescription } from './entities/prescription.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'admin'),
        password: configService.get<string>('DB_PASSWORD', 'root'),
        database: configService.get<string>('DB_NAME', 'chamber_management_system'),
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
        ],
        synchronize: true, // Set to false and use migrations in production
        logging: false,
      }),
    }),
    AuthModule,
    AdminModule,
    DoctorModule,
    PatientModule,
    ChamberModule,
  ],
})
export class AppModule {}
