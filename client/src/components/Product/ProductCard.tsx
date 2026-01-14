import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import type { Product } from '../../services/productService';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const images = productService.getProductImages(product);
  const mainImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/300x300?text=No+Image';
  const price = productService.formatPrice(product.price);

  // Mock số lượng đã bán (có thể lấy từ API sau)
  const soldCount = Math.floor(Math.random() * 200) + 50;

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <div className="product-image-wrapper">
          <img src={mainImage} alt={product.name} className="product-image" />
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          
          <div className="product-price-section">
            <div className="product-price">{price}</div>
            <div className="product-sold">Đã bán: {soldCount}</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
