import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tags, ShoppingCart, 
  Users, Star, ArrowLeft, Shield, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0b1329',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid #1e293b',
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1e293b' }}>
          <div className="veyro-brand">
            <span>VEYRO</span>
            <span className="veyro-brand-badge" style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}>
              ADMIN
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Store Management Portal</p>
        </div>

        <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(13, 148, 136, 0.25)' : 'transparent',
                  borderLeft: isActive ? '3px solid #14b8a6' : '3px solid transparent',
                  transition: 'all 0.15s',
                })}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '1.25rem', borderTop: '1px solid #1e293b' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              marginBottom: '8px',
            }}
          >
            <ArrowLeft size={16} /> Back to Storefront
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: 500,
              width: '100%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <header
          style={{
            backgroundColor: '#ffffff',
            padding: '1rem 2rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} style={{ color: '#0d9488' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Control Center</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{user?.fullName}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Administrator</div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <main style={{ padding: '2rem', flexGrow: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
