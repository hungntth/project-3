import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-title">Linh Kiện Điện Tử</h3>
            <p className="footer-desc">
              Cửa hàng một điểm đến cho các linh kiện máy tính cao cấp và thiết bị gaming chuyên nghiệp.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><Facebook size={20} /></a>
              <a href="#" className="social-link"><Twitter size={20} /></a>
              <a href="#" className="social-link"><Instagram size={20} /></a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-subtitle">Cửa hàng</h4>
            <ul className="footer-links">
              <li><a href="/products">Tất cả sản phẩm</a></li>
              <li><a href="/products?category=1">CPU</a></li>
              <li><a href="/products?category=2">Card đồ họa</a></li>
              <li><a href="/products?category=3">RAM</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-subtitle">Hỗ trợ</h4>
            <ul className="footer-links">
              <li><a href="#">Liên hệ</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
              <li><a href="#">Vận chuyển</a></li>
              <li><a href="#">Đổi trả</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-subtitle">Liên hệ</h4>
            <ul className="contact-info">
              <li><MapPin size={16} /> 123 Đường Công Nghệ, Quận 1, TP.HCM</li>
              <li><Phone size={16} /> +84 (28) 1234-5678</li>
              <li><Mail size={16} /> support@linhkien.vn</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Linh Kiện Điện Tử. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
