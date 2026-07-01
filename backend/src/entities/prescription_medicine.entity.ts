import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity('prescription_medicine')
export class PrescriptionMedicine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prescriptionId: number;

  @Column({ length: 200 })
  medicineName: string;

  @Column({ length: 100 })
  dosage: string;

  @Column({ length: 100 })
  duration: string;

  @ManyToOne(() => Prescription, (p) => p.medicines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescriptionId' })
  prescription: Prescription;
}
