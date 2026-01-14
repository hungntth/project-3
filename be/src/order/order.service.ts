import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from './entities/customer.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async generateOrderCode(): Promise<string> {
    const count = await this.orderRepository.count();
    const code = `DH${String(count + 1).padStart(6, '0')}`;
    
    // Kiểm tra code đã tồn tại chưa
    const existing = await this.orderRepository.findOne({ where: { code } });
    if (existing) {
      // Nếu đã tồn tại, thử với timestamp
      return `DH${Date.now()}`;
    }
    
    return code;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Kiểm tra khách hàng tồn tại
    const customer = await this.customerRepository.findOne({
      where: { id: createOrderDto.customerId },
    });
    if (!customer) {
      throw new NotFoundException('Khách hàng không tồn tại');
    }

    // Kiểm tra sản phẩm và tính tổng tiền
    let total = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of createOrderDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${item.productId} không tồn tại`);
      }

      if (!product.price || product.price <= 0) {
        throw new BadRequestException(`Sản phẩm ${product.name} chưa có giá bán`);
      }

      const subtotal = Number(product.price) * item.quantity;
      total += subtotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: Number(product.price),
        subtotal,
      });
    }

    if (orderItems.length === 0) {
      throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
    }

    // Tạo đơn hàng trong transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const code = await this.generateOrderCode();
      const order = this.orderRepository.create({
        code,
        customerId: customer.id,
        total,
        status: OrderStatus.PENDING,
        notes: createOrderDto.notes,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Tạo các order items
      for (const item of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...item,
          orderId: savedOrder.id,
        });
        await queryRunner.manager.save(OrderItem, orderItem);
      }

      // Cập nhật số lượng tồn kho (trừ đi số lượng đã bán)
      for (const item of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (product) {
          product.currentBalance = Number(product.currentBalance) - item.quantity;
          if (product.currentBalance < 0) {
            throw new BadRequestException(
              `Sản phẩm ${product.name} không đủ số lượng tồn kho`,
            );
          }
          await queryRunner.manager.save(Product, product);
        }
      }

      await queryRunner.commitTransaction();

      // Load lại order với relations
      return await this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['customer', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatus = order.status;
    const newStatus = updateOrderDto.status;

    // Nếu thay đổi trạng thái, cần xử lý cập nhật kho
    if (newStatus && newStatus !== oldStatus) {
      await this.handleStatusChange(order, oldStatus, newStatus);
    }

    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  private async handleStatusChange(
    order: Order,
    oldStatus: OrderStatus,
    newStatus: OrderStatus,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Các trạng thái cần trừ kho (đã trừ từ khi tạo đơn)
      const deductedStatuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.SHIPPING,
        OrderStatus.COMPLETED,
      ];

      // Các trạng thái cần cộng lại kho
      const restockedStatuses = [
        OrderStatus.CANCELLED,
        OrderStatus.RETURNED,
        OrderStatus.RESTOCKED,
      ];

      const wasDeducted = deductedStatuses.includes(oldStatus);
      const willBeDeducted = deductedStatuses.includes(newStatus);
      const willBeRestocked = restockedStatuses.includes(newStatus);

      // Nếu từ trạng thái đã trừ kho chuyển sang trạng thái cần cộng lại
      if (wasDeducted && willBeRestocked) {
        // Cộng lại kho
        for (const item of order.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
          });
          if (product) {
            product.currentBalance = Number(product.currentBalance) + item.quantity;
            await queryRunner.manager.save(Product, product);
          }
        }
      }
      // Nếu từ trạng thái đã cộng lại chuyển sang trạng thái cần trừ
      else if (restockedStatuses.includes(oldStatus) && willBeDeducted) {
        // Trừ lại kho
        for (const item of order.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
          });
          if (product) {
            product.currentBalance = Number(product.currentBalance) - item.quantity;
            if (product.currentBalance < 0) {
              throw new BadRequestException(
                `Sản phẩm ${product.name} không đủ số lượng tồn kho`,
              );
            }
            await queryRunner.manager.save(Product, product);
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    
    // Nếu đơn hàng đang ở trạng thái đã trừ kho, cần cộng lại khi xóa
    const deductedStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.SHIPPING,
      OrderStatus.COMPLETED,
    ];

    if (deductedStatuses.includes(order.status)) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Cộng lại kho
        for (const item of order.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
          });
          if (product) {
            product.currentBalance = Number(product.currentBalance) + item.quantity;
            await queryRunner.manager.save(Product, product);
          }
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    await this.orderRepository.remove(order);
  }
}
