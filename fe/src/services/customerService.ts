import api from './api';

export interface Customer {
  id: number;
  code: string;
  name: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  phone?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
}

export const customerService = {
  async getAllCustomers(): Promise<Customer[]> {
    const response = await api.get<Customer[]>('/customers');
    return response.data;
  },

  async getCustomer(id: number): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },

  async updateCustomer(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const response = await api.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
