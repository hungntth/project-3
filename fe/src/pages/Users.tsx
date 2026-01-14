import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Tag, Alert, Typography, message, Empty, Row, Col } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '../services/userService';
import type { CreateUserDto, User } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CreateUserDto) => {
    try {
      setFormLoading(true);
      await userService.createUser(values);
      message.success('Tạo tài khoản nhân viên thành công!');
      form.resetFields();
      setModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tạo tài khoản nhân viên thất bại');
    } finally {
      setFormLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'blue';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: 'Chức danh',
      dataIndex: 'position',
      key: 'position',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Quyền',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{role.toUpperCase()}</Tag>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <Card>
        <Alert
          message="Không có quyền truy cập"
          description="Bạn không có quyền truy cập trang này"
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={2} className="!mb-2">
            Quản lý Nhân viên
          </Title>
          <Text type="secondary">
            Quản lý tất cả nhân viên trong hệ thống (Chỉ Admin)
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setModalOpen(true)}
        >
          Thêm nhân viên
        </Button>
      </div>

      <Card variant="outlined" className="shadow-sm">
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          locale={{
            emptyText: (
              <Empty
                description={
                  <span>
                    <Text type="secondary">Chưa có nhân viên nào</Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      Nhấn "Thêm nhân viên" để tạo tài khoản mới
                    </Text>
                  </span>
                }
              />
            ),
          }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>Thêm nhân viên mới</span>
          </Space>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="Tài khoản"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
          >
            <Input placeholder="Nhập tài khoản" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input placeholder="0123456789" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Chức danh"
                rules={[{ required: true, message: 'Vui lòng nhập chức danh!' }]}
              >
                <Input placeholder="Ví dụ: Nhân viên, Trưởng phòng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Phòng ban"
                rules={[{ required: true, message: 'Vui lòng nhập phòng ban!' }]}
              >
                <Input placeholder="Ví dụ: Kinh doanh, Kỹ thuật" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="role"
            label="Quyền truy cập"
            initialValue="user"
          >
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setModalOpen(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={formLoading}>
                Tạo nhân viên
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
