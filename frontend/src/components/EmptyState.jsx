import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function EmptyState({
  icon: Icon = ShoppingBag,
  title = 'No items found',
  description = 'Looks like there is nothing to display here yet.',
  actionText = 'Explore Products',
  actionLink = '/products',
}) {
  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '2rem auto',
        maxWidth: '560px',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#ccfbf1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0d9488',
          marginBottom: '1.25rem',
        }}
      >
        <Icon size={36} />
      </div>
      <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#0f172a' }}>{title}</h3>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '380px' }}>
        {description}
      </p>
      {actionLink && actionText && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )}
    </div>
  );
}
