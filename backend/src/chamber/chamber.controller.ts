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
import { ChamberService } from './chamber.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/login.entity';
import { CreateChamberDto } from './dto/create-chamber.dto';
import { UpdateChamberDto } from './dto/update-chamber.dto';

@Controller('doctor/chambers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR)
export class ChamberController {
  constructor(private chamberService: ChamberService) {}

  @Get()
  getChambers(@Request() req) {
    return this.chamberService.getChambers(req.user.doctorId);
  }

  @Post()
  createChamber(@Request() req, @Body() dto: CreateChamberDto) {
    return this.chamberService.createChamber(req.user.doctorId, dto);
  }

  @Patch(':id')
  updateChamber(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChamberDto,
  ) {
    return this.chamberService.updateChamber(id, req.user.doctorId, dto);
  }

  @Delete(':id')
  deleteChamber(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.chamberService.deleteChamber(id, req.user.doctorId);
  }
}
