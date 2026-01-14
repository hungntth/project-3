import { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Table,
  Space,
  Typography,
  Empty,
  Modal,
  Form,
  InputNumber,
  message,
  Tag,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  FileImageOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { orderService } from '../services/orderService';
import type { Order, CreateOrderDto, CreateOrderItemDto } from '../services/orderService';
import { customerService } from '../services/customerService';
import type { Customer, CreateCustomerDto } from '../services/customerService';
import { productService } from '../services/productService';
import type { Product } from '../services/productService';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOrderModalVisible, setCreateOrderModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusUpdatingOrder, setStatusUpdatingOrder] = useState<Order | null>(null);
  const [createCustomerModalVisible, setCreateCustomerModalVisible] = useState(false);
  const [orderItems, setOrderItems] = useState<CreateOrderItemDto[]>([]);
  const [orderForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      message.error('Không thể tải danh sách đơn hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error('Không thể tải danh sách khách hàng', err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
      console.log('Loaded products:', data.length, data);
    } catch (err: any) {
      console.error('Không thể tải danh sách sản phẩm', err);
      message.error('Không thể tải danh sách sản phẩm');
    }
  };

  const handleCreateCustomer = async (values: CreateCustomerDto) => {
    try {
      setLoading(true);
      const newCustomer = await customerService.createCustomer(values);
      message.success('Tạo khách hàng thành công!');
      customerForm.resetFields();
      setCreateCustomerModalVisible(false);
      await loadCustomers();
      // Cập nhật select trong form đơn hàng
      orderForm.setFieldsValue({ customerId: newCustomer.id });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tạo khách hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { productId: 0, quantity: 1 }]);
  };

  const handleRemoveOrderItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleUpdateOrderItem = (index: number, field: keyof CreateOrderItemDto, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleCreateOrder = async () => {
    try {
      if (orderItems.length === 0) {
        message.error('Vui lòng thêm ít nhất một sản phẩm');
        return;
      }

      const customerId = orderForm.getFieldValue('customerId');
      if (!customerId) {
        message.error('Vui lòng chọn khách hàng');
        return;
      }

      // Validate order items
      for (const item of orderItems) {
        if (!item.productId || item.productId <= 0) {
          message.error('Vui lòng chọn sản phẩm cho tất cả các mục');
          return;
        }
        if (!item.quantity || item.quantity <= 0) {
          message.error('Số lượng phải lớn hơn 0');
          return;
        }
      }

      const notes = orderForm.getFieldValue('notes');
      const createOrderDto: CreateOrderDto = {
        customerId,
        items: orderItems,
        notes,
      };

      setLoading(true);
      await orderService.createOrder(createOrderDto);
      message.success('Tạo đơn hàng thành công!');
      orderForm.resetFields();
      setOrderItems([]);
      setCreateOrderModalVisible(false);
      await loadOrders();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Tạo đơn hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      setLoading(true);
      await orderService.deleteOrder(id);
      message.success('Xóa đơn hàng thành công!');
      await loadOrders();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa đơn hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleExportInvoice = async (order: Order) => {
    try {
      setLoading(true);
      // Lấy HTML từ API
      const html = await orderService.getInvoiceHTML(order.id);
      
      // Tạo một iframe ẩn để render HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Cannot access iframe document');
      }
      
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      
      // Đợi cho iframe load xong
      await new Promise((resolve) => {
        iframe.onload = resolve;
        setTimeout(resolve, 1000);
      });
      
      // Chụp ảnh từ iframe
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      // Tạo link download
      const link = document.createElement('a');
      link.download = `HoaDon_${order.code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Cleanup
      document.body.removeChild(iframe);
      
      message.success('Xuất hóa đơn thành công!');
    } catch (err: any) {
      console.error(err);
      message.error('Xuất hóa đơn thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Đơn hàng mới' },
      confirmed: { color: 'blue', text: 'Xác nhận' },
      shipping: { color: 'cyan', text: 'Vận chuyển' },
      completed: { color: 'green', text: 'Giao thành công' },
      returned: { color: 'purple', text: 'Hoàn hàng' },
      restocked: { color: 'geekblue', text: 'Hàng về kho' },
      cancelled: { color: 'red', text: 'Hủy đơn' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };


  const handleUpdateStatus = (order: Order) => {
    setStatusUpdatingOrder(order);
    statusForm.setFieldsValue({
      status: order.status,
      notes: order.notes,
    });
    setStatusModalVisible(true);
  };

  const handleSaveStatus = async () => {
    if (!statusUpdatingOrder) return;

    try {
      setLoading(true);
      const values = statusForm.getFieldsValue();
      await orderService.updateOrder(statusUpdatingOrder.id, {
        status: values.status,
        notes: values.notes,
      });
      message.success('Cập nhật trạng thái thành công!');
      statusForm.resetFields();
      setStatusModalVisible(false);
      setStatusUpdatingOrder(null);
      await loadOrders();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.code.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customer.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.customer.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.customer.code}
          </Text>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (value) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right',
      render: (value) => `${Number(value).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<FileImageOutlined />}
            onClick={() => handleExportInvoice(record)}
          >
            Hóa đơn
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleUpdateStatus(record)}
          >
            Trạng thái
          </Button>
          <Popconfirm
            title="Xóa đơn hàng"
            description="Bạn có chắc chắn muốn xóa đơn hàng này? Hàng sẽ được cộng lại kho nếu đơn đã trừ kho."
            onConfirm={() => handleDeleteOrder(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.price) {
        return sum + Number(product.price) * item.quantity;
      }
      return sum;
    }, 0);
  };

  return (
    <div>
      <div className="mb-6">
        <Title level={2} className="!mb-2">
          Quản lý Đơn hàng
        </Title>
        <Text type="secondary">
          Xem và quản lý tất cả các đơn hàng trong hệ thống
        </Text>
      </div>

      {/* Filters and Actions */}
      <Card variant="outlined" className="shadow-sm mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm đơn hàng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Tất cả trạng thái"
              style={{ width: '100%' }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="pending">Đơn hàng mới</Select.Option>
              <Select.Option value="confirmed">Xác nhận</Select.Option>
              <Select.Option value="shipping">Vận chuyển</Select.Option>
              <Select.Option value="completed">Giao thành công</Select.Option>
              <Select.Option value="returned">Hoàn hàng</Select.Option>
              <Select.Option value="restocked">Hàng về kho</Select.Option>
              <Select.Option value="cancelled">Hủy đơn</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setOrderItems([]);
                orderForm.resetFields();
                setCreateOrderModalVisible(true);
              }}
            >
              Tạo đơn hàng mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card variant="outlined" className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          locale={{
            emptyText: (
              <Empty
                description={
                  <span>
                    <Text type="secondary">Chưa có đơn hàng nào</Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      Các đơn hàng sẽ được hiển thị ở đây khi có dữ liệu
                    </Text>
                  </span>
                }
              />
            ),
          }}
        />
      </Card>

      {/* Create Order Modal */}
      <Modal
        title="Tạo đơn hàng mới"
        open={createOrderModalVisible}
        onCancel={() => {
          setCreateOrderModalVisible(false);
          setOrderItems([]);
          orderForm.resetFields();
        }}
        onOk={handleCreateOrder}
        width={800}
        confirmLoading={loading}
        afterOpenChange={(open) => {
          if (open) {
            // Đảm bảo load lại dữ liệu khi mở modal
            loadProducts().then(() => {
              console.log('Products loaded in modal:', products.length);
            });
            loadCustomers();
          }
        }}
      >
        <Form form={orderForm} layout="vertical">
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              optionFilterProp="children"
              allowClear
              notFoundContent={customers.length === 0 ? 'Đang tải khách hàng...' : 'Không tìm thấy khách hàng'}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCreateCustomerModalVisible(true);
                      }}
                      block
                      style={{ textAlign: 'left' }}
                    >
                      Thêm khách hàng mới
                    </Button>
                  </div>
                </>
              )}
            >
              {customers.map((customer) => (
                <Select.Option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text strong>Sản phẩm</Text>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddOrderItem}>
                Thêm sản phẩm
              </Button>
            </div>
            {orderItems.map((item, index) => {
              const availableProducts = products.filter((p) => {
                // Chỉ hiển thị sản phẩm có giá và giá > 0
                return p.price != null && Number(p.price) > 0;
              });
              
              return (
                <Card key={index} size="small" style={{ marginBottom: 8 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Select
                      placeholder="Chọn sản phẩm"
                      style={{ width: '100%' }}
                      showSearch
                      optionFilterProp="children"
                      value={item.productId > 0 ? item.productId : undefined}
                      onChange={(value) => {
                        console.log('Selecting product:', value);
                        handleUpdateOrderItem(index, 'productId', value);
                      }}
                      allowClear
                      loading={products.length === 0}
                      notFoundContent={
                        products.length === 0 
                          ? 'Đang tải sản phẩm...' 
                          : availableProducts.length === 0
                          ? `Không có sản phẩm nào có giá bán (Tổng: ${products.length} sản phẩm)`
                          : 'Không tìm thấy sản phẩm'
                      }
                    >
                      {availableProducts.map((product) => (
                        <Select.Option key={product.id} value={product.id}>
                          {product.name} {product.code ? `(${product.code})` : ''} - {Number(product.price).toLocaleString('vi-VN')} đ
                        </Select.Option>
                      ))}
                    </Select>
                  <InputNumber
                    placeholder="Số lượng"
                    min={1}
                    style={{ width: '100%' }}
                    value={item.quantity}
                    onChange={(value) => handleUpdateOrderItem(index, 'quantity', value || 1)}
                  />
                  {item.productId && item.productId > 0 && (
                    <Text type="secondary">
                      Thành tiền:{' '}
                      {(() => {
                        const product = products.find((p) => p.id === item.productId);
                        if (product && product.price) {
                          return `${(Number(product.price) * item.quantity).toLocaleString('vi-VN')} đ`;
                        }
                        return '0 đ';
                      })()}
                    </Text>
                  )}
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveOrderItem(index)}
                  >
                    Xóa
                    </Button>
                </Space>
              </Card>
              );
            })}
            {orderItems.length === 0 && (
              <Empty 
                description={
                  <div>
                    <div>Chưa có sản phẩm nào</div>
                    {products.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tổng số sản phẩm: {products.length} 
                        ({products.filter(p => p.price && Number(p.price) > 0).length} có giá bán)
                      </Text>
                    )}
                  </div>
                } 
                style={{ margin: '20px 0' }} 
              />
            )}
            {orderItems.length > 0 && (
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Text strong style={{ fontSize: 18 }}>
                  Tổng tiền: {calculateTotal().toLocaleString('vi-VN')} đ
                </Text>
              </div>
            )}
          </div>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Customer Modal */}
      <Modal
        title="Thêm khách hàng mới"
        open={createCustomerModalVisible}
        onCancel={() => {
          setCreateCustomerModalVisible(false);
          customerForm.resetFields();
        }}
        onOk={() => customerForm.submit()}
        confirmLoading={loading}
      >
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={handleCreateCustomer}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          statusForm.resetFields();
          setStatusUpdatingOrder(null);
        }}
        onOk={handleSaveStatus}
        confirmLoading={loading}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="pending">Đơn hàng mới</Select.Option>
              <Select.Option value="confirmed">Xác nhận</Select.Option>
              <Select.Option value="shipping">Vận chuyển</Select.Option>
              <Select.Option value="completed">Giao thành công</Select.Option>
              <Select.Option value="returned">Hoàn hàng</Select.Option>
              <Select.Option value="restocked">Hàng về kho</Select.Option>
              <Select.Option value="cancelled">Hủy đơn</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>
          {statusUpdatingOrder && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>Lưu ý:</strong> Khi thay đổi trạng thái, hệ thống sẽ tự động cập nhật số lượng tồn kho:
                <br />- Đơn hàng mới/Xác nhận/Vận chuyển/Giao thành công: Trừ kho
                <br />- Hủy đơn/Hoàn hàng/Hàng về kho: Cộng lại kho
              </Text>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};
