import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('backup')
export class Backup {
  @PrimaryGeneratedColumn()
  backupId: number;

  @Column({ length: 255 })
  fileName: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ length: 100 })
  createdBy: string;
}
