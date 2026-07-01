import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';

export enum FeedbackSenderRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

export enum FeedbackStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
}

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  feedbackId: number;

  @Column({ type: 'enum', enum: FeedbackSenderRole })
  senderRole: FeedbackSenderRole;

  @Column({ nullable: true })
  doctorId: number;

  @Column({ nullable: true })
  patientId: number;

  @Column({ length: 200 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: FeedbackStatus, default: FeedbackStatus.PENDING })
  status: FeedbackStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Doctor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => Patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}
