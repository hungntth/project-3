import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Mã khách hàng (tự động sinh)

  @Column()
  name: string; // Tên khách hàng

  @Column({ nullable: true })
  phone: string; // Số điện thoại

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
