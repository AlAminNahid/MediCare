import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/login.entity';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { AppointmentStatus } from '../entities/appointment.entity';

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.doctorService.getDoctorInfo(req.user.doctorId);
  }

  @Patch('profile')
  updateProfile(@Request() req, @Body() dto: UpdateDoctorProfileDto) {
    return this.doctorService.updateDoctorProfile(req.user.doctorId, dto);
  }

  @Get('appointments')
  getAppointments(
    @Request() req,
    @Query('chamberId') chamberId?: string,
    @Query('date') date?: string,
  ) {
    return this.doctorService.getAppointments(
      req.user.doctorId,
      chamberId ? Number(chamberId) : undefined,
      date,
    );
  }

  @Patch('appointments/:id')
  updateAppointment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status?: AppointmentStatus; reason?: string },
  ) {
    return this.doctorService.updateAppointment(req.user.doctorId, id, body);
  }

  @Get('patients')
  getPatients(@Request() req) {
    return this.doctorService.getPatients(req.user.doctorId);
  }

  @Get('medicines')
  getMedicines(@Query('search') search?: string) {
    return this.doctorService.getMedicines(search);
  }

  @Post('prescriptions')
  createPrescription(@Request() req, @Body() dto: CreatePrescriptionDto) {
    return this.doctorService.createPrescription(req.user.doctorId, dto);
  }

  @Get('prescriptions')
  getPrescriptions(@Request() req) {
    return this.doctorService.getPrescriptions(req.user.doctorId);
  }

  @Post('feedback')
  submitFeedback(@Request() req, @Body() body: { subject: string; message: string }) {
    return this.doctorService.submitFeedback(req.user.doctorId, body);
  }
}
