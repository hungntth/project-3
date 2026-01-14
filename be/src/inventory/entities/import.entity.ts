import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../user/entities/user.entity';

@Entity('imports')
export class Import {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  importCode: string; // Mã phiếu nhập

  @Column()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number; // Số lượng nhập

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number; // Đơn giá

  @Column({ type: 'text', nullable: true })
  note: string; // Ghi chú

  @Column()
  createdById: number; // Người tạo

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
