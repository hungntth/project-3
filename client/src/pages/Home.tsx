import { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import ProductCard from '../components/Product/ProductCard';
import productService from '../services/productService';
import type { Product } from '../services/productService';
import './Home.css';

interface Category {
  id: number;
  name: string;
  image: string;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/categories`)
            .then(res => res.json())
            .catch(() => [])
        ]);

        // Lấy 8 sản phẩm đầu tiên làm featured
        setProducts(productsData.slice(0, 8));
        
        // Map categories với hình ảnh mặc định
        setCategories(categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=500'
        })));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Xây Dựng <span className="text-gradient">Máy Tính Mơ Ước</span> Của Bạn
            </h1>
            <p className="hero-subtitle">
              Trải nghiệm hiệu năng vượt trội với bộ sưu tập linh kiện máy tính cao cấp của chúng tôi.
            </p>
            <div className="hero-actions">
              <Link to="/products">
                <Button variant="primary" size="lg">
                  Mua ngay <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="lg">Xem sản phẩm</Button>
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-glow"></div>
            <img 
              src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1000" 
              alt="Gaming PC Setup" 
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Mua theo danh mục</h2>
            <Link to="/products" className="view-all-link">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link to={`/products?category=${cat.id}`} key={cat.id} className="category-card">
                <div className="category-image-wrapper">
                  <img src={cat.image} alt={cat.name} className="category-image" />
                  <div className="category-overlay"></div>
                </div>
                <h3 className="category-name">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm nổi bật</h2>
            <p className="section-desc">Lựa chọn hàng đầu cho nâng cấp tiếp theo của bạn</p>
          </div>
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Chưa có sản phẩm nào</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Promo Section */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-banner">
            <div className="promo-content">
              <h2>Nâng Cấp Hệ Thống Của Bạn</h2>
              <p>Giảm giá lên đến 20% cho các card đồ họa NVIDIA trong tuần này.</p>
              <Link to="/products">
                <Button variant="primary">Xem ưu đãi</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
