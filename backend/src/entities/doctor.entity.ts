import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Chamber } from './chamber.entity';
import { Prescription } from './prescription.entity';

@Entity('doctor')
export class Doctor {
  @PrimaryGeneratedColumn()
  doctorId: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ length: 100, nullable: true })
  specialization: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  visitFee: number;

  @Column({ type: 'simple-array', nullable: true })
  degrees: string[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => Chamber, (chamber) => chamber.doctor)
  chambers: Chamber[];

  @OneToMany(() => Prescription, (prescription) => prescription.doctor)
  prescriptions: Prescription[];
}
