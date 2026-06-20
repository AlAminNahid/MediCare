import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';
import { Medicine } from './medicine.entity';

@Entity('prescription')
export class Prescription {
  @PrimaryGeneratedColumn()
  prescriptionId: number;

  @Column()
  doctorId: number;

  @Column()
  patientId: number;

  @Column()
  medicineId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', nullable: true })
  additionalNotes: string;

  @Column({ length: 50 })
  dosage: string;

  @Column({ length: 50 })
  duration: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.prescriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Medicine, (medicine) => medicine.prescriptions)
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;
}
