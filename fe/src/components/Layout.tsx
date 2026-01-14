import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Dropdown, Space, Badge, Button, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  ImportOutlined,
  ExportOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div className="px-2 py-1">
          <div className="font-medium text-gray-900">{user?.fullName || user?.username}</div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
              {user?.role}
            </span>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => navigate('/change-password'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const getSelectedKeys = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    if (path.startsWith('/inventory')) {
      if (tab === 'products') return ['inventory-products'];
      if (tab === 'import') return ['inventory-import'];
      if (tab === 'export') return ['inventory-export'];
      if (tab === 'report') return ['inventory-report'];
      return ['inventory-products']; // default
    }
    if (path === '/categories') return ['categories'];
    return [path.replace('/', '') || 'dashboard'];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'inventory-products':
        navigate('/inventory?tab=products', { replace: false });
        break;
      case 'inventory-import':
        navigate('/inventory?tab=import', { replace: false });
        break;
      case 'inventory-export':
        navigate('/inventory?tab=export', { replace: false });
        break;
      case 'inventory-report':
        navigate('/inventory?tab=report', { replace: false });
        break;
      case 'users':
        navigate('/users');
        break;
      case 'categories':
        navigate('/categories');
        break;
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
    },
    {
      key: 'orders',
      label: 'Đơn hàng',
    },
    {
      key: 'inventory',
      label: 'Kho',
      icon: <InboxOutlined />,
      children: [
        {
          key: 'inventory-products',
          label: 'Sản phẩm',
          icon: <InboxOutlined />,
        },
        {
          key: 'inventory-import',
          label: 'Nhập kho',
          icon: <ImportOutlined />,
        },
        {
          key: 'inventory-export',
          label: 'Xuất kho',
          icon: <ExportOutlined />,
        },
        {
          key: 'inventory-report',
          label: 'Báo cáo',
          icon: <FileTextOutlined />,
        },
      ],
    },
    {
      key: 'categories',
      label: 'Nhóm hàng',
      icon: <AppstoreOutlined />,
    },
    ...(isAdmin
      ? [
          {
            key: 'users',
            label: 'Quản lý Nhân viên',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        {/* Top Bar */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Quản lý Đơn hàng</span>
              </Link>

              {/* Right Side - Utility Icons */}
              <div className="hidden md:flex items-center space-x-4">
                <Badge count={0} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined className="text-gray-600" />}
                    className="flex items-center"
                  />
                </Badge>
                <Button
                  type="text"
                  icon={<SettingOutlined className="text-gray-600" />}
                />
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <Space className="cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded hover:bg-gray-50">
                    <Avatar
                      style={{ backgroundColor: '#6366f1' }}
                      icon={<UserOutlined />}
                      size="small"
                    >
                      {getInitials(user?.fullName || user?.username)}
                    </Avatar>
                  </Space>
                </Dropdown>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu Bar */}
        <div className="bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hidden lg:flex items-center h-12">
              <Menu
                mode="horizontal"
                items={menuItems}
                selectedKeys={getSelectedKeys()}
                onClick={handleMenuClick}
                className="bg-indigo-600 border-none flex-1 [&_.ant-menu-item]:!text-white [&_.ant-menu-item]:!font-medium [&_.ant-menu-item-selected]:!bg-indigo-700 [&_.ant-menu-item-selected]:!text-white [&_.ant-menu-item:hover]:!bg-indigo-700/80 [&_.ant-menu-item:hover]:!text-white [&_.ant-menu-submenu-title]:!text-white [&_.ant-menu-submenu-title]:!font-medium [&_.ant-menu-submenu-title:hover]:!bg-indigo-700/80 [&_.ant-menu-submenu-title:hover]:!text-white [&_.ant-menu-submenu-arrow]:!text-white [&_.ant-menu-submenu-popup]:!bg-white [&_.ant-menu-submenu-popup]:!shadow-lg [&_.ant-menu-submenu-popup_.ant-menu-item]:!text-gray-700 [&_.ant-menu-submenu-popup_.ant-menu-item:hover]:!bg-indigo-50 [&_.ant-menu-submenu-popup_.ant-menu-item-selected]:!bg-indigo-100 [&_.ant-menu-submenu-popup_.ant-menu-item-selected]:!text-indigo-700 [&_.ant-menu-submenu-popup_.ant-menu-item-selected]:!font-medium"
                style={{ 
                  lineHeight: '48px', 
                  minWidth: 0, 
                  flex: 1,
                  backgroundColor: 'transparent',
                }}
              />
              <Button
                type="default"
                icon={<ShoppingCartOutlined />}
                className="ml-4 border-white text-white hover:bg-indigo-700 hover:border-indigo-700"
              >
                Bán hàng
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/orders')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Đơn hàng
              </Link>
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm font-medium text-gray-700">Kho</div>
                <Link
                  to="/inventory?tab=products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-6 py-2 rounded-md text-sm transition-colors ${
                    isActive('/inventory')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Sản phẩm
                </Link>
                <Link
                  to="/inventory?tab=import"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-6 py-2 rounded-md text-sm transition-colors ${
                    isActive('/inventory')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Nhập kho
                </Link>
                <Link
                  to="/inventory?tab=export"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-6 py-2 rounded-md text-sm transition-colors ${
                    isActive('/inventory')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Xuất kho
                </Link>
                <Link
                  to="/inventory?tab=report"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-6 py-2 rounded-md text-sm transition-colors ${
                    isActive('/inventory')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Báo cáo
                </Link>
              </div>
              {isAdmin && (
                <Link
                  to="/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/users')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Quản lý Nhân viên
                </Link>
              )}
              <div className="pt-4 border-t border-gray-200 mt-2">
                <Dropdown menu={{ items: userMenuItems }} placement="topRight" arrow>
                  <Space className="cursor-pointer w-full justify-between p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        style={{ backgroundColor: '#6366f1' }}
                        icon={<UserOutlined />}
                        size="small"
                      >
                        {getInitials(user?.fullName || user?.username)}
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          {user?.fullName || user?.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Space>
                </Dropdown>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
};
