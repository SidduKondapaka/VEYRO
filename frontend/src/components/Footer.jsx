import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#070c1e', color: '#94a3b8', marginTop: 'auto', borderTop: '1px solid #1e293b' }}>
      {/* Features Value Strip */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '2rem 0', backgroundColor: '#0b1329' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>Fast Delivery</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Free shipping over ₹500</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>Secure Checkout</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Protected transactions</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={22} />
            </div>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>Easy Cancellation</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Instant stock restoration</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={22} />
            </div>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>24/7 Assistance</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Ready customer support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '3.5rem 1.25rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
          <div>
            <div className="veyro-brand" style={{ marginBottom: '1rem' }}>
              <span>VEYRO</span>
              <span className="veyro-brand-badge">PRO</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#64748b', marginBottom: '1rem' }}>
              Next-generation full-stack e-commerce marketplace platform engineered for speed, trust, and exceptional customer experience.
            </p>
            <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
              Technical Training Class Project
            </span>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Explore Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <li><Link to="/products?category=electronics" style={{ color: '#94a3b8' }}>Electronics</Link></li>
              <li><Link to="/products?category=fashion" style={{ color: '#94a3b8' }}>Fashion & Apparel</Link></li>
              <li><Link to="/products?category=home-kitchen" style={{ color: '#94a3b8' }}>Home & Kitchen</Link></li>
              <li><Link to="/products?category=books" style={{ color: '#94a3b8' }}>Books & Literature</Link></li>
              <li><Link to="/products?category=beauty-personal-care" style={{ color: '#94a3b8' }}>Beauty & Personal Care</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <li><Link to="/profile" style={{ color: '#94a3b8' }}>Your Account</Link></li>
              <li><Link to="/orders" style={{ color: '#94a3b8' }}>Track Orders</Link></li>
              <li><Link to="/addresses" style={{ color: '#94a3b8' }}>Delivery Addresses</Link></li>
              <li><Link to="/wishlist" style={{ color: '#94a3b8' }}>Wishlist</Link></li>
              <li><a href="/swagger-ui.html" target="_blank" rel="noreferrer" style={{ color: '#14b8a6', fontWeight: 600 }}>OpenAPI / Swagger</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Demo Credentials</h4>
            <div style={{ backgroundColor: '#131e3a', padding: '1rem', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid #1e293b' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#14b8a6', fontWeight: 600 }}>Customer:</span>
                <div style={{ color: '#e2e8f0' }}>customer@veyro.com</div>
                <div style={{ color: '#64748b' }}>Pass: Customer@123456!</div>
              </div>
              <div>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>Admin:</span>
                <div style={{ color: '#e2e8f0' }}>admin@veyro.com</div>
                <div style={{ color: '#64748b' }}>Pass: Admin@123456!</div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>
            © {new Date().getFullYear()} VEYRO Marketplace. All rights reserved. Original project implementation.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Built with Spring Boot 3, Java 21, MySQL & React.js
          </div>
        </div>
      </div>
    </footer>
  );
}
