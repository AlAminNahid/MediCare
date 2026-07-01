import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity('medicine')
export class Medicine {
  @PrimaryGeneratedColumn()
  medicineId: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50 })
  strength: string;

  @Column({ length: 100 })
  manufacturerName: string;

  @OneToMany(() => Prescription, (prescription) => prescription.medicine)
  prescriptions: Prescription[];
}
