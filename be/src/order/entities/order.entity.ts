import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending', // Đơn hàng mới
  CONFIRMED = 'confirmed', // Xác nhận
  SHIPPING = 'shipping', // Vận chuyển
  COMPLETED = 'completed', // Giao thành công
  RETURNED = 'returned', // Hoàn hàng
  RESTOCKED = 'restocked', // Hàng về kho
  CANCELLED = 'cancelled', // Hủy đơn
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Mã đơn hàng (tự động sinh)

  @Column()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number; // Tổng tiền

  @Column({
    type: 'varchar',
    length: 20,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string; // Ghi chú

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
