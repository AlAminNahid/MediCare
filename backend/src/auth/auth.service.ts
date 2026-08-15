import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
  private refreshJwtService: JwtService;

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
    private configService: ConfigService,
  ) {
    this.refreshJwtService = new JwtService({
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      signOptions: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as any,
      },
    });
  }

  async register(dto: RegisterDto) {
    const existing = await this.loginRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already registered');

    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }

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

    if (!dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.issueTokens(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      role: user.role,
      adminId: user.adminId,
      doctorId: user.doctorId,
      patientId: user.patientId,
    };
  }

  private async issueTokens(user: Login) {
    const payload = {
      sub: user.loginId,
      email: user.email,
      role: user.role,
      adminId: user.adminId,
      doctorId: user.doctorId,
      patientId: user.patientId,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.refreshJwtService.sign({ sub: user.loginId });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.loginRepo.save(user);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let loginId: number;
    try {
      const decoded = this.refreshJwtService.verify<{ sub: number }>(
        refreshToken,
      );
      loginId = decoded.sub;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.loginRepo.findOne({ where: { loginId } });
    if (!user || !user.refreshTokenHash)
      throw new UnauthorizedException('Invalid refresh token');

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');

    const { accessToken, refreshToken: newRefreshToken } =
      await this.issueTokens(user);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      role: user.role,
      adminId: user.adminId,
      doctorId: user.doctorId,
      patientId: user.patientId,
    };
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return { message: 'Logged out' };
    try {
      const decoded = this.refreshJwtService.verify<{ sub: number }>(
        refreshToken,
      );
      await this.loginRepo.update(
        { loginId: decoded.sub },
        { refreshTokenHash: null as unknown as string },
      );
    } catch {
      // token already invalid/expired — nothing to revoke
    }
    return { message: 'Logged out' };
  }

  async forgotPassword(dto: ForgetPasswordDto) {
    const user = await this.loginRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Email not found');

    if (!dto.newPassword) {
      throw new BadRequestException('New password is required');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.loginRepo.save(user);

    return { message: 'Password updated successfully' };
  }
}
