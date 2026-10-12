import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', fontWeight: 900, color: '#0d9488', lineHeight: 1, marginBottom: '1rem' }}>
        404
      </div>
      <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.75rem' }}>Page Not Found</h1>
      <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '440px', margin: '0 auto 2rem' }}>
        The page you are looking for does not exist, was removed, or is temporarily unavailable.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Go to Storefront
        </Link>
        <Link to="/products" className="btn btn-secondary">
          Browse Products
        </Link>
      </div>
    </div>
  );
}
