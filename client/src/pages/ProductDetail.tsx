import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../components/UI/Button';
import productService from '../services/productService';
import type { Product } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        const data = await productService.getProductById(parseInt(id));
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container product-not-found">
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/products">
          <Button>Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  const images = productService.getProductImages(product);
  const mainImage = images.length > 0 ? images[selectedImageIndex] : 'https://via.placeholder.com/600x600?text=No+Image';
  const price = productService.formatPrice(product.price);

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/products" className="back-link">
          <ArrowLeft size={16} /> Quay lại sản phẩm
        </Link>
        
        <div className="product-detail-grid">
          {/* Image */}
          <div className="product-detail-image-wrapper">
            <div className="detail-image-container">
              <img src={mainImage} alt={product.name} className="detail-image" />
            </div>
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <div className="detail-header">
              {product.category && (
                <span className="detail-category">{product.category.name}</span>
              )}
              <h1 className="detail-title">{product.name}</h1>
              {product.brand && (
                <span className="detail-brand">Thương hiệu: {product.brand.name}</span>
              )}
            </div>

            <div className="detail-price-section">
              <span className="detail-price">{price}</span>
              <span className={`stock-status ${product.currentBalance > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.currentBalance > 0 ? `Còn ${product.currentBalance} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            {product.description && (
              <div 
                className="detail-description"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            {product.warrantyPeriod && (
              <div className="warranty-info">
                <ShieldCheck size={20} style={{ marginRight: '8px', color: '#10b981' }} />
                <span>Bảo hành {product.warrantyPeriod} tháng</span>
              </div>
            )}

            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(val, product.currentBalance || 1)));
                  }}
                  min="1"
                  max={product.currentBalance || 1}
                  className="qty-input"
                />
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.min((product.currentBalance || 1), quantity + 1))}
                  disabled={quantity >= (product.currentBalance || 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <Button 
                size="lg" 
                className="add-to-cart-large"
                disabled={product.currentBalance === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={20} style={{ marginRight: '8px' }} />
                Thêm vào giỏ
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                disabled={product.currentBalance === 0}
                onClick={handleBuyNow}
              >
                Mua ngay
              </Button>
            </div>

            <div className="product-features">
              <div className="feature-item">
                <Truck size={20} className="feature-icon" />
                <div>
                  <h4>Miễn phí vận chuyển</h4>
                  <p>Cho đơn hàng trên 2.000.000đ</p>
                </div>
              </div>
              <div className="feature-item">
                <ShieldCheck size={20} className="feature-icon" />
                <div>
                  <h4>Bảo hành chính hãng</h4>
                  <p>Bảo vệ toàn diện</p>
                </div>
              </div>
              <div className="feature-item">
                <RefreshCw size={20} className="feature-icon" />
                <div>
                  <h4>Đổi trả 30 ngày</h4>
                  <p>Không cần lý do</p>
                </div>
              </div>
            </div>

            {product.weight && (
              <div className="product-specs">
                <h4>Thông số kỹ thuật</h4>
                <ul>
                  <li><strong>Mã sản phẩm:</strong> {product.code}</li>
                  <li><strong>Trọng lượng:</strong> {product.weight} {product.weightUnit || 'g'}</li>
                  <li><strong>Đơn vị tính:</strong> {product.unit || 'cái'}</li>
                  {product.warehouse && (
                    <li><strong>Kho:</strong> {product.warehouse.name}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
