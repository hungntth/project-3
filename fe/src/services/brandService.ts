import api from './api';

export interface Brand {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandDto {
  name: string;
}

export const brandService = {
  async getAllBrands(): Promise<Brand[]> {
    const response = await api.get<Brand[]>('/brands');
    return response.data;
  },

  async createBrand(data: CreateBrandDto): Promise<Brand> {
    const response = await api.post<Brand>('/brands', data);
    return response.data;
  },
};
