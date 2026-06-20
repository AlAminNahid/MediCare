import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { CreateSlotDto } from './dto/create-slot.dto';

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
  getAppointments(@Request() req) {
    return this.doctorService.getAppointments(req.user.doctorId);
  }

  @Patch('appointments/:id')
  updateAppointment(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { date?: string; time?: string; status?: string; reason?: string },
  ) {
    return this.doctorService.updateAppointment(req.user.doctorId, id, body);
  }

  @Get('patients')
  getPatients(@Request() req) {
    return this.doctorService.getPatients(req.user.doctorId);
  }

  @Get('medicines')
  getMedicines() {
    return this.doctorService.getMedicines();
  }

  @Post('prescriptions')
  createPrescription(@Request() req, @Body() dto: CreatePrescriptionDto) {
    return this.doctorService.createPrescription(req.user.doctorId, dto);
  }

  @Get('prescriptions')
  getPrescriptions(@Request() req) {
    return this.doctorService.getPrescriptions(req.user.doctorId);
  }

  @Get('slots')
  getSlots(@Request() req) {
    return this.doctorService.getSlots(req.user.doctorId);
  }

  @Post('slots')
  createSlot(@Request() req, @Body() dto: CreateSlotDto) {
    return this.doctorService.createSlot(req.user.doctorId, dto);
  }

  @Patch('slots/:id')
  updateSlot(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { startTime?: string; endTime?: string; days?: string[] },
  ) {
    return this.doctorService.updateSlot(id, req.user.doctorId, body);
  }

  @Delete('slots/:id')
  deleteSlot(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.doctorService.deleteSlot(id, req.user.doctorId);
  }
}
