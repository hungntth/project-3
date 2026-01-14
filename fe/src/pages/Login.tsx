import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      await login(values.username, values.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <Card
        className="w-full max-w-md shadow-lg"
        variant="outlined"
        style={{ borderRadius: '12px' }}
      >
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            Hệ thống Quản lý Đơn hàng
          </Title>
          <Text type="secondary">Đăng nhập để tiếp tục</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            className="mb-6"
            onClose={() => setError('')}
          />
        )}

        <Form
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="h-11"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center">
          <Space orientation="vertical" size="small">
            <Text type="secondary" className="text-xs">Tài khoản mặc định:</Text>
            <Text code className="text-xs">admin / admin</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};
