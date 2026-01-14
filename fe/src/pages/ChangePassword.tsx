import { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import { message } from 'antd';

const { Title, Text } = Typography;

export const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      form.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="!mb-2">
          Đổi mật khẩu
        </Title>
        <Text type="secondary">
          Thay đổi mật khẩu của bạn để bảo mật tài khoản
        </Text>
      </div>

      <Card variant="outlined" className="shadow-sm">
        <Form
          form={form}
          name="change-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<SafetyOutlined />}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<SafetyOutlined />}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Alert
        message="Lưu ý"
        description="Sau khi đổi mật khẩu thành công, bạn sẽ cần đăng nhập lại với mật khẩu mới."
        type="warning"
        showIcon
        className="mt-6"
      />
    </div>
  );
};
