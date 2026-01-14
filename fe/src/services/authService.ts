import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    role: 'admin' | 'manager' | 'user';
  };
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
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string; user: User }> {
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', {
      refresh_token: refreshToken,
    });
  },

  async logoutAll(): Promise<void> {
    await api.post('/auth/logout-all');
  },

  async verify(): Promise<{ valid: boolean; user: User }> {
    const response = await api.post('/auth/verify');
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data;
  },
};
