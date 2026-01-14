import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async generateCustomerCode(): Promise<string> {
    const count = await this.customerRepository.count();
    const code = `KH${String(count + 1).padStart(6, '0')}`;
    
    // Kiểm tra code đã tồn tại chưa
    const existing = await this.customerRepository.findOne({ where: { code } });
    if (existing) {
      // Nếu đã tồn tại, thử với timestamp
      return `KH${Date.now()}`;
    }
    
    return code;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const code = await this.generateCustomerCode();

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      code,
    });

    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Khách hàng không tồn tại');
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }
}
