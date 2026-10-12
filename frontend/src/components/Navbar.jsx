import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingCart, Heart, User, LogOut, Package, 
  MapPin, Shield, Menu, X, ChevronDown, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../api/axios';
import { FALLBACK_CATEGORIES } from '../api/fallbackData';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      } catch (err) {
        // Keep fallback categories intact
      }
    };
    fetchCategories();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim() || selectedCategory) {
      let query = `/products?`;
      if (keyword.trim()) query += `keyword=${encodeURIComponent(keyword.trim())}&`;
      if (selectedCategory) query += `category=${encodeURIComponent(selectedCategory)}&`;
      navigate(query.replace(/&$/, ''));
    } else {
      navigate('/products');
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: '#070c1e',
          color: '#94a3b8',
          fontSize: '0.78rem',
          padding: '6px 0',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#14b8a6' }}>
              <Sparkles size={14} /> Free Express Delivery on orders over ₹500
            </span>
            <span style={{ display: 'none', color: '#64748b' }}>•</span>
            <span style={{ color: '#94a3b8' }}>100% Genuine Marketplace</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>DEMO MODE</span>
            {isAdmin && (
              <Link to="/admin" style={{ color: '#14b8a6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={13} /> Admin Portal
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{ backgroundColor: 'var(--nav-bg)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          
          {/* Brand Logo */}
          <Link to="/" className="veyro-brand">
            <span>VEYRO</span>
            <span className="veyro-brand-badge">PRO</span>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              flexGrow: 1,
              maxWidth: '650px',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRight: '1px solid #e2e8f0',
                padding: '0 12px',
                fontSize: '0.85rem',
                color: '#475569',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '140px',
              }}
            >
              <option value="">All Categories</option>
              {(Array.isArray(categories) ? categories : FALLBACK_CATEGORIES).map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search products, brands, essentials..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flexGrow: 1,
                border: 'none',
                padding: '10px 14px',
                outline: 'none',
                fontSize: '0.925rem',
                color: '#0f172a',
              }}
            />

            <button
              type="submit"
              style={{
                backgroundColor: '#0d9488',
                color: '#ffffff',
                padding: '0 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0f766e')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0d9488')}
            >
              <Search size={18} />
            </button>
          </form>

          {/* Nav Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                color: '#f8fafc',
                padding: '6px',
              }}
              title="My Wishlist"
            >
              <Heart size={22} />
              {wishlist.totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-4px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {wishlist.totalItems}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f8fafc',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              title="Shopping Cart"
            >
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={22} />
                {cart.totalItems > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cart.totalItems}
                  </span>
                )}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'none' }}>
                Cart
              </span>
            </Link>

            {/* User Account Dropdown */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hello,</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.fullName?.split(' ')[0]}
                    </div>
                  </div>
                  <ChevronDown size={14} style={{ color: '#94a3b8' }} />
                </button>

                {showUserMenu && (
                  <div
                    className="card animate-fade-in"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '220px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      padding: '8px 0',
                      zIndex: 200,
                    }}
                  >
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{user?.fullName}</p>
                      <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{user?.email}</p>
                    </div>

                    <Link to="/profile" className="dropdown-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.875rem', color: '#334155' }}>
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/orders" className="dropdown-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.875rem', color: '#334155' }}>
                      <Package size={16} /> My Orders
                    </Link>
                    <Link to="/addresses" className="dropdown-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.875rem', color: '#334155' }}>
                      <MapPin size={16} /> Saved Addresses
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="dropdown-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.875rem', color: '#0d9488', fontWeight: 600 }}>
                        <Shield size={16} /> Admin Portal
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px' }}>
                      <button
                        onClick={logout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '0.875rem',
                          color: '#ef4444',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/login" className="btn btn-outline btn-sm" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: '#ffffff', display: 'none', padding: '4px' }}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Sub-Navigation Bar */}
      <nav style={{ backgroundColor: 'var(--nav-surface)', borderBottom: '1px solid var(--nav-border)', padding: '8px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <Link
            to="/products"
            style={{
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            All Products
          </Link>
          {(Array.isArray(categories) ? categories : FALLBACK_CATEGORIES).map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              style={{
                color: '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#14b8a6')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
