import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/Product/ProductCard';
import Button from '../components/UI/Button';
import productService from '../services/productService';
import type { Product } from '../services/productService';
import './ProductList.css';

interface Category {
  id: number;
  name: string;
}

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/categories`)
            .then(res => res.json())
            .catch(() => [])
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Lấy danh sách brands từ products
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach(p => {
      if (p.brand?.name) brandSet.add(p.brand.name);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(p => p.categoryId === parseInt(activeCategory));
    }

    // Filter by price
    filtered = filtered.filter(p => {
      if (!p.price) return false;
      return p.price >= priceRange[0] && p.price <= priceRange[1];
    });

    // Filter by brand
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => 
        p.brand?.name && selectedBrands.includes(p.brand.name)
      );
    }

    return filtered;
  }, [products, activeCategory, priceRange, selectedBrands]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  if (loading) {
    return (
      <div className="product-list-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            {activeCategory 
              ? categories.find(c => c.id === parseInt(activeCategory))?.name || 'Tất cả sản phẩm'
              : 'Tất cả sản phẩm'}
          </h1>
          <p className="page-desc">
            Duyệt qua bộ sưu tập linh kiện máy tính đa dạng của chúng tôi.
          </p>
        </div>

        <div className="shop-layout">
          {/* Sidebar */}
          <aside className={`shop-sidebar ${showFilters ? 'active' : ''}`}>
            <div className="sidebar-header">
              <h3>Bộ lọc</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="close-filters-btn"
                onClick={() => setShowFilters(false)}
              >
                Đóng
              </Button>
            </div>

            <div className="filter-group">
              <h4>Danh mục</h4>
              <ul className="category-filter-list">
                <li>
                  <button 
                    className={`filter-link ${!activeCategory ? 'active' : ''}`}
                    onClick={() => setSearchParams({})}
                  >
                    Tất cả danh mục
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button 
                      className={`filter-link ${activeCategory === cat.id.toString() ? 'active' : ''}`}
                      onClick={() => setSearchParams({ category: cat.id.toString() })}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h4>Khoảng giá</h4>
              <div className="price-range">
                <input 
                  type="range" 
                  min="0" 
                  max="50000000" 
                  step="1000000"
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                />
                <div className="range-labels">
                  <span>{productService.formatPrice(priceRange[0])}</span>
                  <span>{productService.formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </div>
            
            <div className="filter-group">
              <h4>Thương hiệu</h4>
              <div className="checkbox-list">
                {brands.map(brand => (
                  <label key={brand} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    /> 
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid - Mobile Filter Toggle */}
          <div className="shop-content">
            <div className="shop-controls">
              <span className="result-count">
                Tìm thấy {filteredProducts.length} sản phẩm
              </span>
              <div className="controls-right">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} style={{ marginRight: '8px' }} /> Bộ lọc
                </Button>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <SlidersHorizontal size={48} className="no-products-icon" />
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Hãy thử điều chỉnh bộ lọc của bạn.</p>
                <Button variant="primary" onClick={() => {
                  setSearchParams({});
                  setPriceRange([0, 50000000]);
                  setSelectedBrands([]);
                }}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
