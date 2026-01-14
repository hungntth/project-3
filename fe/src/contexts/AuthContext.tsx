import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { User } from '../services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token và load user
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token
          const response = await authService.verify();
          if (response.valid) {
            // Get full user profile
            const profile = await userService.getProfile();
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          } else {
            // Token không hợp lệ, xóa
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    // Get full user profile
    const profile = await userService.getProfile();
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
