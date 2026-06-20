import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Login, UserRole } from '../entities/login.entity';
import { Admin } from '../entities/admin.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Login)
    private loginRepo: Repository<Login>,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.loginRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const login = this.loginRepo.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
    });

    if (dto.role === UserRole.ADMIN) {
      const admin = await this.adminRepo.save(
        this.adminRepo.create({
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          email: dto.email,
        }),
      );
      login.adminId = admin.adminId;
    } else if (dto.role === UserRole.DOCTOR) {
      const doctor = await this.doctorRepo.save(
        this.doctorRepo.create({
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
        }),
      );
      login.doctorId = doctor.doctorId;
    } else if (dto.role === UserRole.PATIENT) {
      const patient = await this.patientRepo.save(
        this.patientRepo.create({
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
        }),
      );
      login.patientId = patient.patientId;
    }

    await this.loginRepo.save(login);
    return { message: 'Registration successful' };
  }

  async login(dto: LoginDto) {
    const user = await this.loginRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.loginId,
      email: user.email,
      role: user.role,
      adminId: user.adminId,
      doctorId: user.doctorId,
      patientId: user.patientId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      adminId: user.adminId,
      doctorId: user.doctorId,
      patientId: user.patientId,
    };
  }

  async forgotPassword(dto: ForgetPasswordDto) {
    const user = await this.loginRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Email not found');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.loginRepo.save(user);

    return { message: 'Password updated successfully' };
  }
}
