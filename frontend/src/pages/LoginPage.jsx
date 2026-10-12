import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.roles?.includes('ROLE_ADMIN') && from === '/') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      // Handled in AuthContext
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem 5rem', maxWidth: '460px' }}>
      <div className="card animate-fade-in" style={{ padding: '2.5rem', backgroundColor: '#ffffff', borderRadius: '16px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="veyro-brand" style={{ justifyContent: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#0f172a' }}>VEYRO</span>
            <span className="veyro-brand-badge">PRO</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '4px' }}>Sign In to Your Account</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Enter your credentials to manage orders and access VEYRO.
          </p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
            ⚡ Project Viva / Review Quick Login:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@veyro.com', 'Customer@123456!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 8px' }}
            >
              <UserCheck size={14} style={{ color: '#0d9488' }} /> Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@veyro.com', 'Admin@123456!')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 8px' }}
            >
              <Shield size={14} style={{ color: '#f59e0b' }} /> Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have a VEYRO account?{' '}
          <Link to="/register" style={{ color: '#0d9488', fontWeight: 600 }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}
