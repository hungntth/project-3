import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Tên kho

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
