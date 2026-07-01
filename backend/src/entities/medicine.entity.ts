import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
