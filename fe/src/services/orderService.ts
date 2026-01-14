import api from './api';

export const OrderStatus = {
  PENDING: 'pending', // Đơn hàng mới
  CONFIRMED: 'confirmed', // Xác nhận
  SHIPPING: 'shipping', // Vận chuyển
  COMPLETED: 'completed', // Giao thành công
  RETURNED: 'returned', // Hoàn hàng
  RESTOCKED: 'restocked', // Hàng về kho
  CANCELLED: 'cancelled', // Hủy đơn
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: {
    id: number;
    code: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  code: string;
  customerId: number;
  customer: {
    id: number;
    code: string;
    name: string;
    phone?: string;
  };
  total: number;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
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

export interface UpdateOrderDto {
  status?: OrderStatus;
  notes?: string;
}

export const orderService = {
  async getAllOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async getOrder(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: CreateOrderDto): Promise<Order> {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  async updateOrder(id: number, data: UpdateOrderDto): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}`, data);
    return response.data;
  },

  async deleteOrder(id: number): Promise<void> {
    await api.delete(`/orders/${id}`);
  },

  async getInvoiceHTML(id: number): Promise<string> {
    const response = await api.get(`/orders/${id}/invoice`, {
      responseType: 'text',
    });
    return response.data;
  },
};
