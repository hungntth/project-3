import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import { useCart } from '../contexts/CartContext';
import orderService from '../services/orderService';
import type { CreateCustomerDto } from '../services/orderService';
import productService from '../services/productService';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    if (items.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setLoading(true);
    try {
      // Tạo khách hàng
      const customerData: CreateCustomerDto = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };
      
      const customer = await orderService.createCustomer(customerData);
      
      // Tạo đơn hàng
      const orderData = {
        customerId: customer.id,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        notes: formData.notes.trim() || undefined,
      };
      
      const order = await orderService.createOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Show success
      setOrderCode(order.code);
      setOrderSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const total = getTotal();
  const shipping = total >= 2000000 ? 0 : 50000;
  const finalTotal = total + shipping;

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart-message">
            <h2>Giỏ hàng trống</h2>
            <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
            <Link to="/products">
              <Button variant="primary">Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="order-success">
            <CheckCircle size={64} className="success-icon" />
            <h1>Đặt hàng thành công!</h1>
            <p className="order-code">Mã đơn hàng: <strong>{orderCode}</strong></p>
            <p className="success-message">
              Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <p className="redirect-message">Đang chuyển về trang chủ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <Link to="/cart" className="back-link">
          <ArrowLeft size={16} /> Quay lại giỏ hàng
        </Link>

        <div className="checkout-layout">
          <div className="checkout-form-section">
            <h2 className="section-title">Thông tin đặt hàng</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="name">
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Nhập họ và tên"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Ghi chú (tùy chọn)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ghi chú cho đơn hàng..."
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </Button>
            </form>
          </div>

          <div className="checkout-summary-section">
            <h2 className="section-title">Đơn hàng của bạn</h2>
            <div className="order-items">
              {items.map((item) => (
                <div key={item.product.id} className="order-item">
                  <div className="item-info">
                    <h4>{item.product.name}</h4>
                    <p className="item-quantity">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    {productService.formatPrice((item.product.price || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{productService.formatPrice(total)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{shipping === 0 ? 'Miễn phí' : productService.formatPrice(shipping)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Tổng cộng:</span>
                <span className="total-price">{productService.formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
