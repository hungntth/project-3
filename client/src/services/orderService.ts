import api from './api';

export interface CreateCustomerDto {
  name: string;
  phone?: string;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: number;
  items: CreateOrderItemDto[];
  notes?: string;
}

export interface Order {
  id: number;
  code: string;
  customerId: number;
  customer: Customer;
  total: number;
  status: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

class OrderService {
  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    return await api.post<Customer>('/customers', data);
  }

  async createOrder(data: CreateOrderDto): Promise<Order> {
    return await api.post<Order>('/orders', data);
  }
}

export default new OrderService();
