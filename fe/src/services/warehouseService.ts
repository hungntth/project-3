import api from './api';

export interface Warehouse {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  name: string;
}

export const warehouseService = {
  async getAllWarehouses(): Promise<Warehouse[]> {
    const response = await api.get<Warehouse[]>('/warehouses');
    return response.data;
  },

  async createWarehouse(data: CreateWarehouseDto): Promise<Warehouse> {
    const response = await api.post<Warehouse>('/warehouses', data);
    return response.data;
  },
};
