import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Prescription } from './prescription.entity';

export enum MedicineStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

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

  @Column({
    type: 'enum',
    enum: MedicineStatus,
    default: MedicineStatus.ACTIVE,
  })
  status: MedicineStatus;

  @OneToMany(() => Prescription, (prescription) => prescription.medicine)
  prescriptions: Prescription[];
}
