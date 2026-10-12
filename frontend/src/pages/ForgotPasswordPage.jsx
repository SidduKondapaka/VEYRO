import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setGeneratedToken(res.data.data);
      showSuccess('Password reset token generated!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to request reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem 5rem', maxWidth: '460px' }}>
      <div className="card animate-fade-in" style={{ padding: '2.5rem', backgroundColor: '#ffffff', borderRadius: '16px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ccfbf1',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '4px' }}>Forgot Password</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Enter your registered email address to receive a secure password reset token.
          </p>
        </div>

        {generatedToken ? (
          <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span className="badge badge-teal" style={{ marginBottom: '8px' }}>Development Demo Mode</span>
            <p style={{ fontSize: '0.85rem', color: '#0f766e', marginBottom: '10px' }}>
              Your secure one-time password reset token:
            </p>
            <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #0d9488', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', marginBottom: '14px', color: '#0f172a', fontWeight: 600 }}>
              {generatedToken}
            </div>
            <Link
              to={`/reset-password?token=${generatedToken}`}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              Proceed to Reset Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="customer@veyro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <span>{loading ? 'Generating...' : 'Get Reset Token'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
