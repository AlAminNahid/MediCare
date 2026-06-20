import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/login.entity';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.patientService.getPatientInfo(req.user.patientId);
  }

  @Patch('profile')
  updateProfile(@Request() req, @Body() dto: UpdatePatientProfileDto) {
    return this.patientService.updatePatientProfile(req.user.patientId, dto);
  }

  @Get('doctors')
  getDoctors() {
    return this.patientService.getDoctors();
  }

  @Post('appointments')
  bookAppointment(@Request() req, @Body() dto: BookAppointmentDto) {
    return this.patientService.bookAppointment(req.user.patientId, dto);
  }

  @Get('appointments')
  getAppointments(@Request() req) {
    return this.patientService.getAppointments(req.user.patientId);
  }

  @Patch('appointments/:id/cancel')
  cancelAppointment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.patientService.cancelAppointment(id, req.user.patientId);
  }

  @Get('prescriptions')
  getPrescriptions(@Request() req) {
    return this.patientService.getPrescriptions(req.user.patientId);
  }
}
