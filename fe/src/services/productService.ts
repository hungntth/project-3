import api from './api';

export interface Product {
  id: number;
  code: string;
  name: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  brandId?: number;
  brand?: {
    id: number;
    name: string;
  };
  price?: number;
  warehouseId?: number;
  warehouse?: {
    id: number;
    name: string;
  };
  weight?: number;
  weightUnit?: string;
  description?: string;
  unit?: string;
  images?: string; // JSON array
  openingBalance: number;
  currentBalance: number;
  warrantyPeriod?: number; // Thời gian bảo hành (tháng, từ 1-24)
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  code?: string; // Mã hàng (tự động sinh nếu không nhập)
  name: string; // Tên hàng
  categoryId?: number; // Nhóm hàng
  brandId?: number; // Thương hiệu
  price: number; // Giá bán (bắt buộc)
  warehouseId?: number; // Kho
  weight?: number; // Trọng lượng
  weightUnit?: string; // Đơn vị trọng lượng (g hoặc kg)
  description?: string; // Mô tả (HTML)
  unit?: string; // Đơn vị tính
  images?: string; // JSON array
  openingBalance?: number;
  warrantyPeriod?: number; // Thời gian bảo hành (tháng, từ 1-24)
}

export interface UpdateProductDto {
  code?: string;
  name?: string;
  categoryId?: number;
  brandId?: number;
  price?: number;
  warehouseId?: number;
  weight?: number;
  weightUnit?: string;
  description?: string;
  unit?: string;
  images?: string;
  openingBalance?: number;
  warrantyPeriod?: number; // Thời gian bảo hành (tháng, từ 1-24)
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  async getProduct(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async uploadImages(images: File[]): Promise<string[]> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    const response = await api.post<{ urls: string[] }>('/products/upload', formData);
    return response.data.urls;
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  async updateProduct(id: number, data: UpdateProductDto): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
