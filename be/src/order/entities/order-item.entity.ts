import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number; // Số lượng

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Giá bán tại thời điểm tạo đơn

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // Thành tiền (quantity * price)
}
