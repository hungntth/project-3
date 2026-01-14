import api from './api';

export interface CreateUserDto {
  username: string;
  password: string;
  role?: 'admin' | 'manager' | 'user';
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'user';
  fullName?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>('/users/change-password', data);
    return response.data;
  },
};
