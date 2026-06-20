import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  adminId: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ length: 100, nullable: true })
  email: string;
}
