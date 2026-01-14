import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { Warehouse } from './warehouse.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  code: string; // Mã hàng (tự động sinh nếu không nhập)

  @Column()
  name: string; // Tên hàng

  @Column({ nullable: true })
  categoryId: number; // Nhóm hàng

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  brandId: number; // Thương hiệu

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Giá bán (bắt buộc)

  @Column({ nullable: true })
  warehouseId: number; // Kho

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number; // Trọng lượng

  @Column({ type: 'varchar', length: 10, nullable: true })
  weightUnit: string; // Đơn vị trọng lượng (g hoặc kg)

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả (HTML)

  @Column({ type: 'varchar', nullable: true })
  unit: string; // Đơn vị tính (giữ lại để tương thích)

  @Column({ type: 'text', nullable: true })
  images: string; // JSON array chứa đường dẫn ảnh

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  openingBalance: number; // Số dư đầu kỳ

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentBalance: number; // Số dư hiện tại

  @Column({ type: 'int', nullable: true })
  warrantyPeriod: number; // Thời gian bảo hành (tháng, từ 1-24)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
