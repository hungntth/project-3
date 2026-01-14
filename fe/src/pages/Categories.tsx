import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  message,
  Empty,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { categoryService } from '../services/categoryService';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../services/categoryService';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export const Categories = () => {
  const { isAdmin, isManager } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      message.error('Không thể tải danh sách nhóm hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      setLoading(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, values);
        message.success('Cập nhật nhóm hàng thành công!');
      } else {
        await categoryService.createCategory(values);
        message.success('Tạo nhóm hàng thành công!');
      }
      form.resetFields();
      setModalOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({ name: category.name });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await categoryService.deleteCategory(id);
      message.success('Xóa nhóm hàng thành công!');
      await loadCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa nhóm hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setModalOpen(false);
    setEditingCategory(null);
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên nhóm hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (value) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (value) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!isAdmin && !isManager}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa nhóm hàng"
            description="Bạn có chắc chắn muốn xóa nhóm hàng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={!isAdmin && !isManager}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={2} className="!mb-2">
            Quản lý Nhóm hàng
          </Title>
          <Text type="secondary">
            Quản lý tất cả các nhóm hàng trong hệ thống
          </Text>
        </div>
        {(isAdmin || isManager) && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setEditingCategory(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            Thêm nhóm hàng
          </Button>
        )}
      </div>

      <Card variant="outlined" className="shadow-sm">
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhóm hàng`,
          }}
          locale={{
            emptyText: (
              <Empty
                description={
                  <span>
                    <Text type="secondary">Chưa có nhóm hàng nào</Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      {(isAdmin || isManager) && 'Nhấn "Thêm nhóm hàng" để tạo mới'}
                    </Text>
                  </span>
                }
              />
            ),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            <AppstoreOutlined />
            <span>{editingCategory ? 'Sửa nhóm hàng' : 'Thêm nhóm hàng mới'}</span>
          </Space>
        }
        open={modalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Tên nhóm hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm hàng!' }]}
          >
            <Input placeholder="Nhập tên nhóm hàng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
