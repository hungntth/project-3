import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  position: string; // Chức danh

  @Column({ nullable: true })
  department: string; // Phòng ban

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
