import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Prescription } from './prescription.entity';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn()
  patientId: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  age: number;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => Prescription, (prescription) => prescription.patient)
  prescriptions: Prescription[];
}
