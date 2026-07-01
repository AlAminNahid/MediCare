import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Appointment } from './appointment.entity';

export enum DayOfWeek {
  MON = 'Mon',
  TUE = 'Tue',
  WED = 'Wed',
  THU = 'Thu',
  FRI = 'Fri',
  SAT = 'Sat',
  SUN = 'Sun',
}

@Entity('chamber')
export class Chamber {
  @PrimaryGeneratedColumn()
  chamberId: number;

  @Column()
  doctorId: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 255 })
  address: string;

  // PostgreSQL does not have SET type; storing days as a text array
  @Column({ type: 'simple-array' })
  days: DayOfWeek[];

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  visitFee: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.chambers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @OneToMany(() => Appointment, (appointment) => appointment.chamber)
  appointments: Appointment[];
}
