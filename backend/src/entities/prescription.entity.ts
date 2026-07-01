import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';
import { Chamber } from './chamber.entity';
import { PrescriptionMedicine } from './prescription_medicine.entity';

@Entity('prescription')
export class Prescription {
  @PrimaryGeneratedColumn()
  prescriptionId: number;

  @Column()
  doctorId: number;

  @Column()
  patientId: number;

  @Column({ nullable: true })
  chamberId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Chamber, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'chamberId' })
  chamber: Chamber;

  @OneToMany(() => PrescriptionMedicine, (pm) => pm.prescription, { cascade: true })
  medicines: PrescriptionMedicine[];
}
