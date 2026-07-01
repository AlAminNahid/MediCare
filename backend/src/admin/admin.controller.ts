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
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/login.entity';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { AddMedicineDto } from './dto/add-medicine.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('profile')
  getAdminInfo(@Request() req) {
    return this.adminService.getAdminInfo(req.user.adminId);
  }

  @Patch('profile')
  updateProfile(@Request() req, @Body() dto: UpdateAdminProfileDto) {
    return this.adminService.updateAdminProfile(req.user.adminId, dto);
  }

  // Doctors (read-only oversight)
  @Get('doctors')
  getDoctors() {
    return this.adminService.getDoctors();
  }

  // Patients (read-only oversight)
  @Get('patients')
  getPatients() {
    return this.adminService.getPatients();
  }

  // Appointments (read-only oversight)
  @Get('appointments')
  getAppointments() {
    return this.adminService.getAppointments();
  }

  // Medicines (reference list)
  @Get('medicines')
  getMedicines() {
    return this.adminService.getMedicines();
  }

  @Post('medicines')
  addMedicine(@Body() dto: AddMedicineDto) {
    return this.adminService.addMedicine(dto);
  }

  @Delete('medicines/:id')
  deleteMedicine(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteMedicine(id);
  }

  // Backups
  @Get('backups')
  getBackups() {
    return this.adminService.getBackups();
  }

  @Get('backups/download')
  async downloadBackup(@Res() res: Response) {
    const sql = await this.adminService.generateSqlDump();
    const ts = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15);
    const fileName = `backup_${ts}.sql`;
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(sql);
  }

  @Post('backups')
  insertBackup(@Body('fileName') fileName: string, @Request() req) {
    return this.adminService.insertBackup(fileName, req.user.email);
  }

  @Delete('backups/:id')
  deleteBackup(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBackup(id);
  }

  @Get('feedback')
  getFeedbacks() {
    return this.adminService.getFeedbacks();
  }

  @Patch('feedback/:id/reviewed')
  markFeedbackReviewed(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.markFeedbackReviewed(id);
  }
}
