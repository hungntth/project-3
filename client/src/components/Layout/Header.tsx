import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Sun, Moon, X } from 'lucide-react';
import Button from '../UI/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import './Header.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { getItemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">Linh Kiện Điện Tử</Link>
        
        {/* Desktop Nav */}
        <nav className="nav-menu">
          <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Trang chủ
          </NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Sản phẩm
          </NavLink>
        </nav>

        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Tìm kiếm linh kiện..." />
          </div>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={22} />
            {getItemCount() > 0 && (
              <span className="cart-badge">{getItemCount()}</span>
            )}
          </Link>
          
          <Button 
            variant="primary" 
            size="sm" 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      {/* Mobile Menu Sidebar */}
      <div className={`mobile-menu-sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <span className="logo">Menu</span>
          <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="mobile-search">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Tìm kiếm..." />
        </div>

        <nav className="mobile-nav">
          <NavLink to="/" className={({isActive}) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>
            Trang chủ
          </NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>
            Sản phẩm
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
