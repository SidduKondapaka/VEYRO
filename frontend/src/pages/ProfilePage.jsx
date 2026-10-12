import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Package, MapPin, Heart, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function ProfilePage() {
  const { user, updateCurrentUser, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('/users/me', {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      updateCurrentUser(res.data);
      showSuccess('Profile details updated successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/users/me/change-password', {
        currentPassword,
        newPassword,
      });
      showSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem', maxWidth: '980px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>My Account</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Manage your personal details, saved preferences, and account security.
        </p>
      </div>

      {/* Account Quick Nav Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <Link to="/orders" className="card card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#ffffff' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Your Orders</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Track & view orders</div>
          </div>
        </Link>

        <Link to="/addresses" className="card card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#ffffff' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Addresses</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivery destinations</div>
          </div>
        </Link>

        <Link to="/wishlist" className="card card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#ffffff' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Wishlist</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Saved items</div>
          </div>
        </Link>

        {isAdmin && (
          <Link to="/admin" className="card card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#ffffff' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Admin Portal</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Manage store</div>
            </div>
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Personal Details Form */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <User size={20} style={{ color: '#0d9488' }} /> Personal Information
          </h2>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="form-input"
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Email cannot be changed</span>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Avatar Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <Save size={16} />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <Lock size={20} style={{ color: '#0d9488' }} /> Security & Password
          </h2>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="btn btn-secondary"
              style={{ width: '100%', borderColor: '#0d9488', color: '#0d9488' }}
            >
              <Lock size={16} />
              <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
