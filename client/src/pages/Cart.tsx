import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import { useCart } from '../contexts/CartContext';
import productService from '../services/productService';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotal } = useCart();

  const subtotal = getTotal();
  const shipping = subtotal >= 2000000 ? 0 : 50000; // Free shipping over 2M VND
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="cart-title">Giỏ hàng của bạn</h1>
          <div className="empty-cart">
            <p>Giỏ hàng của bạn đang trống</p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => {
              const images = productService.getProductImages(item.product);
              const imageUrl = images.length > 0 ? images[0] : 'https://via.placeholder.com/150';
              return (
                <div key={item.product.id} className="cart-item">
                  <Link to={`/products/${item.product.id}`} className="item-image-container">
                    <img src={imageUrl} alt={item.product.name} />
                  </Link>
                  <div className="item-details">
                    <Link to={`/products/${item.product.id}`}>
                      <h3 className="item-name">{item.product.name}</h3>
                    </Link>
                    <p className="item-price">
                      {productService.formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product.currentBalance || 0)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="item-total">
                    {productService.formatPrice((item.product.price || 0) * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{productService.formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span className={shipping === 0 ? 'free-shipping' : ''}>
                {shipping === 0 ? 'Miễn phí' : productService.formatPrice(shipping)}
              </span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Tổng cộng</span>
              <span>{productService.formatPrice(total)}</span>
            </div>
            
            <Button 
              size="lg" 
              className="checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Thanh toán <ArrowRight size={20} style={{ marginLeft: '8px' }} />
            </Button>
            
            <Link to="/products" className="continue-shopping">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
