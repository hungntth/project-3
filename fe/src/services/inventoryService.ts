import api from './api';

export interface Import {
  id: number;
  importCode: string;
  productId: number;
  product?: {
    id: number;
    code: string;
    name: string;
  };
  quantity: number;
  unitPrice?: number;
  note?: string;
  createdById: number;
  createdBy?: {
    id: number;
    username: string;
    fullName?: string;
  };
  createdAt: string;
}

export interface Export {
  id: number;
  exportCode: string;
  productId: number;
  product?: {
    id: number;
    code: string;
    name: string;
  };
  quantity: number;
  unitPrice?: number;
  note?: string;
  createdById: number;
  createdBy?: {
    id: number;
    username: string;
    fullName?: string;
  };
  createdAt: string;
}

export interface CreateImportDto {
  productId: number;
  quantity: number;
  unitPrice?: number;
  note?: string;
}

export interface CreateExportDto {
  productId: number;
  quantity: number;
  unitPrice?: number;
  note?: string;
}

export interface UpdateImportDto {
  productId?: number;
  quantity?: number;
  unitPrice?: number;
  note?: string;
}

export interface UpdateExportDto {
  productId?: number;
  quantity?: number;
  unitPrice?: number;
  note?: string;
}

export interface InventoryReport {
  product: {
    id: number;
    code: string;
    name: string;
    unit?: string;
  };
  openingBalance: number;
  totalImport: number;
  totalExport: number;
  currentBalance: number;
  endingBalance: number;
}

export const inventoryService = {
  async createImport(data: CreateImportDto): Promise<Import> {
    const response = await api.post<Import>('/inventory/import', data);
    return response.data;
  },

  async createExport(data: CreateExportDto): Promise<Export> {
    const response = await api.post<Export>('/inventory/export', data);
    return response.data;
  },

  async getAllImports(): Promise<Import[]> {
    const response = await api.get<Import[]>('/inventory/imports');
    return response.data;
  },

  async getAllExports(): Promise<Export[]> {
    const response = await api.get<Export[]>('/inventory/exports');
    return response.data;
  },

  async getInventoryReport(productId?: number): Promise<InventoryReport[]> {
    const params = productId ? { productId } : {};
    const response = await api.get<InventoryReport[]>('/inventory/report', { params });
    return response.data;
  },

  async getImportById(id: number): Promise<Import> {
    const response = await api.get<Import>(`/inventory/imports/${id}`);
    return response.data;
  },

  async getExportById(id: number): Promise<Export> {
    const response = await api.get<Export>(`/inventory/exports/${id}`);
    return response.data;
  },

  async updateImport(id: number, data: UpdateImportDto): Promise<Import> {
    const response = await api.put<Import>(`/inventory/imports/${id}`, data);
    return response.data;
  },

  async updateExport(id: number, data: UpdateExportDto): Promise<Export> {
    const response = await api.put<Export>(`/inventory/exports/${id}`, data);
    return response.data;
  },

  async deleteImport(id: number): Promise<void> {
    await api.delete(`/inventory/imports/${id}`);
  },

  async deleteExport(id: number): Promise<void> {
    await api.delete(`/inventory/exports/${id}`);
  },
};
