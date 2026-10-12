import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    defaultAddress: false,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/addresses');
      setAddresses(res.data);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddressId(null);
    setAddressForm({
      recipientName: '',
      phone: '',
      streetAddress: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      defaultAddress: addresses.length === 0,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      recipientName: addr.recipientName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      defaultAddress: addr.defaultAddress,
    });
    setFormOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await api.put(`/users/me/addresses/${editingAddressId}`, addressForm);
        showSuccess('Address updated successfully!');
      } else {
        await api.post('/users/me/addresses', addressForm);
        showSuccess('New address added!');
      }
      setFormOpen(false);
      fetchAddresses();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await api.delete(`/users/me/addresses/${addressToDelete.id}`);
      showSuccess('Address deleted successfully.');
      setDeleteModalOpen(false);
      fetchAddresses();
    } catch (err) {
      showError('Failed to delete address.');
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      await api.patch(`/users/me/addresses/${addrId}/default`);
      showSuccess('Default delivery address updated!');
      fetchAddresses();
    } catch (err) {
      showError('Failed to set default address.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your delivery addresses..." />;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem', maxWidth: '960px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to My Account
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Delivery Addresses</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Manage shipping addresses for fast and seamless checkout.
            </p>
          </div>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add New Address
          </button>
        </div>
      </div>

      {formOpen && (
        <div className="card animate-fade-in" style={{ padding: '1.75rem', backgroundColor: '#ffffff', marginBottom: '2rem', border: '2px solid #0d9488' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a' }}>
            {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </h2>

          <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name / Recipient</label>
                <input
                  type="text"
                  required
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Street Address</label>
              <input
                type="text"
                required
                placeholder="Flat / House no., Floor, Building Name, Street"
                value={addressForm.streetAddress}
                onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">City</label>
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">State</label>
                <input
                  type="text"
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  required
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', marginTop: '6px' }}>
              <input
                type="checkbox"
                checked={addressForm.defaultAddress}
                onChange={(e) => setAddressForm({ ...addressForm, defaultAddress: e.target.checked })}
                style={{ accentColor: '#0d9488', width: '16px', height: '16px' }}
              />
              <span>Set as default delivery address</span>
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary">Save Address</button>
              <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="card"
            style={{
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              border: addr.defaultAddress ? '2px solid #0d9488' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {addr.defaultAddress && (
              <span className="badge badge-teal" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
                DEFAULT ADDRESS
              </span>
            )}

            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginBottom: '4px' }}>
              {addr.recipientName}
            </div>

            <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '8px', flexGrow: 1 }}>
              {addr.streetAddress}{addr.apartment ? `, ${addr.apartment}` : ''}<br />
              {addr.city}, {addr.state} - {addr.postalCode}<br />
              {addr.country}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Phone: {addr.phone}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <button
                onClick={() => handleOpenEdit(addr)}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 size={14} /> Edit
              </button>

              <button
                onClick={() => {
                  setAddressToDelete(addr);
                  setDeleteModalOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={14} /> Delete
              </button>

              {!addr.defaultAddress && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="btn btn-outline btn-sm"
                  style={{ marginLeft: 'auto' }}
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Address"
        message="Are you sure you want to delete this delivery address?"
        confirmText="Delete"
        cancelText="Cancel"
        isDanger
        onConfirm={handleDeleteAddress}
        onCancel={() => {
          setDeleteModalOpen(false);
          setAddressToDelete(null);
        }}
      />
    </div>
  );
}
