import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Empty, Table, Tag, Progress } from 'antd';
import {
  ShoppingOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  UndoOutlined,
  InboxOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import type { Order } from '../services/orderService';

const { Title, Text } = Typography;

export const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Không thể tải danh sách đơn hàng', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status: string) => {
    return orders.filter((order) => order.status === status).length;
  };

  const getTotalRevenue = () => {
    return orders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + Number(order.total), 0);
  };

  const getCompletionRate = () => {
    if (orders.length === 0) return 0;
    const completed = getStatusCount('completed');
    return Math.round((completed / orders.length) * 100);
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

  const recentOrders = orders.slice(0, 5);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, record: Order) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customer.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.customer.code}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      align: 'right' as const,
      render: (value: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {Number(value).toLocaleString('vi-VN')} đ
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
  ];

  const mainStats = [
    {
      title: 'Tổng đơn hàng',
      value: orders.length,
      prefix: <ShoppingOutlined style={{ fontSize: 24 }} />,
      color: '#1890ff',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Doanh thu',
      value: getTotalRevenue(),
      prefix: <DollarOutlined style={{ fontSize: 24 }} />,
      color: '#52c41a',
      bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      suffix: ' đ',
      formatter: (value: number) => `${Number(value).toLocaleString('vi-VN')}`,
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: getCompletionRate(),
      prefix: <RiseOutlined style={{ fontSize: 24 }} />,
      color: '#722ed1',
      bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      suffix: '%',
    },
  ];

  const statusStats = [
    {
      title: 'Đơn hàng mới',
      value: getStatusCount('pending'),
      icon: <PlusCircleOutlined />,
      color: '#fa8c16',
    },
    {
      title: 'Xác nhận',
      value: getStatusCount('confirmed'),
      icon: <CheckCircleOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Vận chuyển',
      value: getStatusCount('shipping'),
      icon: <TruckOutlined />,
      color: '#13c2c2',
    },
    {
      title: 'Giao thành công',
      value: getStatusCount('completed'),
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Hoàn hàng',
      value: getStatusCount('returned'),
      icon: <UndoOutlined />,
      color: '#722ed1',
    },
    {
      title: 'Hàng về kho',
      value: getStatusCount('restocked'),
      icon: <InboxOutlined />,
      color: '#2f54eb',
    },
    {
      title: 'Hủy đơn',
      value: getStatusCount('cancelled'),
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f',
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-2" style={{ marginBottom: 8 }}>
          Chào mừng, {user?.fullName || user?.username}! 👋
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Tổng quan hệ thống quản lý đơn hàng
        </Text>
      </div>

      {/* Main Stats Cards */}
      <Row gutter={[24, 24]} className="mb-6">
        {mainStats.map((stat, index) => (
          <Col xs={24} sm={24} md={8} key={index}>
            <Card
              className="shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: 'none',
                background: stat.bgGradient,
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    {stat.title}
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        lineHeight: 1,
                      }}
                    >
                      {stat.formatter ? stat.formatter(stat.value) : stat.value}
                    </Text>
                    {stat.suffix && (
                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '18px' }}>
                        {stat.suffix}
                      </Text>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 28,
                  }}
                >
                  {stat.prefix}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Status Stats Grid */}
      <Card
        variant="outlined"
        className="shadow-sm mb-6"
        style={{ borderRadius: '12px' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>Thống kê theo trạng thái</span>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          {statusStats.map((stat, index) => (
            <Col xs={12} sm={8} md={6} lg={3} xl={3} key={index}>
              <Card
                className="hover:shadow-md transition-all duration-200"
                style={{
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center',
                  height: '100%',
                }}
                bodyStyle={{ padding: '20px 16px' }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontSize: 24,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {stat.title}
                    </Text>
                  }
                  value={stat.value}
                  valueStyle={{
                    color: stat.color,
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Completion Rate */}
      {orders.length > 0 && (
        <Card
          variant="outlined"
          className="shadow-sm mb-6"
          style={{ borderRadius: '12px' }}
        >
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 16 }}>
              Tỷ lệ hoàn thành đơn hàng
            </Text>
          </div>
          <Progress
            percent={getCompletionRate()}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            strokeWidth={12}
            format={(percent) => `${percent}%`}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <Text type="secondary">
              Đã hoàn thành: <Text strong>{getStatusCount('completed')}</Text>
            </Text>
            <Text type="secondary">
              Tổng đơn hàng: <Text strong>{orders.length}</Text>
            </Text>
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <Card
        variant="outlined"
        className="shadow-sm"
        style={{ borderRadius: '12px' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>Đơn hàng gần đây</span>
          </div>
        }
        extra={
          recentOrders.length > 0 && (
            <Text type="secondary" style={{ fontSize: 14 }}>
              Hiển thị 5 đơn hàng mới nhất
            </Text>
          )
        }
      >
        {recentOrders.length > 0 ? (
          <Table
            columns={columns}
            dataSource={recentOrders}
            rowKey="id"
            pagination={false}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        ) : (
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
            style={{ padding: '40px 0' }}
          />
        )}
      </Card>
    </div>
  );
};
