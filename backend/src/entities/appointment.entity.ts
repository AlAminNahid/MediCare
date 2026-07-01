import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';
import { Chamber } from './chamber.entity';

export enum AppointmentStatus {
  WAITING = 'Waiting',
  SERVING = 'Serving',
  DONE = 'Done',
  CANCELLED = 'Cancelled',
  NO_SHOW = 'No Show',
}

@Entity('appointment')
@Unique(['chamberId', 'date', 'serialNumber'])
export class Appointment {
  @PrimaryGeneratedColumn()
  appointmentId: number;

  @Column()
  doctorId: number;

  @Column()
  patientId: number;

  @Column()
  chamberId: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  serialNumber: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.WAITING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Chamber, (chamber) => chamber.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chamberId' })
  chamber: Chamber;
}
