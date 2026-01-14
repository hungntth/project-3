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
  warrantyPeriod?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
}

class ProductService {
  async getAllProducts(): Promise<Product[]> {
    try {
      // API này yêu cầu authentication, nhưng có thể public endpoint
      // Nếu cần auth, sẽ cần thêm token vào header
      return await api.get<Product[]>('/products');
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<Product> {
    return await api.get<Product>(`/products/${id}`);
  }

  getProductImages(product: Product): string[] {
    if (!product.images) return [];
    try {
      const images = JSON.parse(product.images);
      return images.map((img: string) => {
        // Kiểm tra nếu là URL công khai
        if (img.startsWith('http://') || img.startsWith('https://')) {
          return img;
        }
        // Nếu không, thêm base URL
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        return `${API_URL}${img}`;
      });
    } catch (e) {
      return [];
    }
  }

  formatPrice(price?: number): string {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }
}

export default new ProductService();
