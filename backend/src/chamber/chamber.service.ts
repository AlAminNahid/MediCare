import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chamber } from '../entities/chamber.entity';
import { CreateChamberDto } from './dto/create-chamber.dto';
import { UpdateChamberDto } from './dto/update-chamber.dto';

@Injectable()
export class ChamberService {
  constructor(
    @InjectRepository(Chamber) private chamberRepo: Repository<Chamber>,
  ) {}

  getChambers(doctorId: number) {
    return this.chamberRepo.find({ where: { doctorId } });
  }

  async createChamber(doctorId: number, dto: CreateChamberDto) {
    const chamber = this.chamberRepo.create({ ...dto, doctorId });
    return this.chamberRepo.save(chamber);
  }

  async updateChamber(chamberId: number, doctorId: number, dto: UpdateChamberDto) {
    const chamber = await this.chamberRepo.findOne({ where: { chamberId, doctorId } });
    if (!chamber) throw new NotFoundException('Chamber not found');
    Object.assign(chamber, dto);
    return this.chamberRepo.save(chamber);
  }

  async deleteChamber(chamberId: number, doctorId: number) {
    const chamber = await this.chamberRepo.findOne({ where: { chamberId, doctorId } });
    if (!chamber) throw new NotFoundException('Chamber not found');
    await this.chamberRepo.remove(chamber);
    return { message: 'Chamber deleted' };
  }
}
