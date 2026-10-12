import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 32, message = 'Loading...', fullPage = false }) {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2rem' }}>
      <Loader2 size={size} className="animate-spin" style={{ color: '#0d9488' }} />
      {message && <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
}
