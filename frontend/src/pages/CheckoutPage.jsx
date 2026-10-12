import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, CreditCard, Banknote, ShieldCheck, 
  MapPin, Plus, ArrowRight, ArrowLeft, AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quick new address form inside checkout
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: user?.fullName || '',
    phone: user?.phone || '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    defaultAddress: true,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/users/me/addresses');
        setAddresses(res.data);
        if (res.data.length > 0) {
          const defaultAddr = res.data.find((a) => a.defaultAddress) || res.data[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error('Failed to load addresses', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/me/addresses', newAddress);
      setAddresses([res.data, ...addresses]);
      setSelectedAddressId(res.data.id);
      setShowAddressForm(false);
      showSuccess('Delivery address saved!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showError('Please select or add a delivery address.');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      showError('Your cart is empty.');
      navigate('/cart');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/orders/checkout', {
        addressId: selectedAddressId,
        paymentMethod,
        notes: orderNotes.trim() || undefined,
      });

      await refreshCart();
      showSuccess('Order placed successfully!');
      navigate(`/order-confirmation/${res.data.orderNumber}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete checkout.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Preparing checkout..." />;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Secure Checkout</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Review your items, address, and demo payment option.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Delivery Address & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 2 }}>
          
          {/* Step 1: Address Selection */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                  1
                </div>
                <h2 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Delivery Address</h2>
              </div>
              {!showAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="btn btn-outline btn-sm"
                >
                  <Plus size={14} /> Add New Address
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House/flat no., building name, street"
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary btn-sm">Save & Use Address</button>
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  )}
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(Array.isArray(addresses) ? addresses : []).map((addr) => (
                  <label
                    key={addr.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: selectedAddressId === addr.id ? '2px solid #0d9488' : '1px solid #e2e8f0',
                      backgroundColor: selectedAddressId === addr.id ? '#f0fdfa' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="deliveryAddress"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      style={{ marginTop: '4px', accentColor: '#0d9488' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {addr.recipientName} <span style={{ fontWeight: 400, color: '#64748b' }}>({addr.phone})</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                        {addr.streetAddress}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}, {addr.state} - {addr.postalCode}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                2
              </div>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Payment Method</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: paymentMethod === 'COD' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  backgroundColor: paymentMethod === 'COD' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: '#0d9488' }}
                />
                <Banknote size={20} style={{ color: '#0d9488' }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pay in cash or UPI upon package delivery</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: paymentMethod === 'DEMO_CARD' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  backgroundColor: paymentMethod === 'DEMO_CARD' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="DEMO_CARD"
                  checked={paymentMethod === 'DEMO_CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: '#0d9488' }}
                />
                <CreditCard size={20} style={{ color: '#0d9488' }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Simulated Card / NetBanking</span>
                    <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>DEMO MODE</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Instant simulation for technical demonstration</div>
                </div>
              </label>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Delivery Instructions / Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="E.g., Leave with front desk, call upon arrival"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="form-textarea"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff', position: 'sticky', top: '140px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a' }}>Order Review</h2>

          {/* Items summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '4px' }}>
            {(Array.isArray(cart?.items) ? cart.items : []).map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.quantity}x {item.productName}
                </span>
                <span style={{ fontWeight: 600 }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal:</span>
              <span>₹{Number(cart.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Delivery Fee:</span>
              <span>{cart.estimatedShipping === 0 ? <strong style={{ color: '#047857' }}>FREE</strong> : `₹${Number(cart.estimatedShipping).toLocaleString('en-IN')}`}</span>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              <span>Total Payable:</span>
              <span>₹{Number(cart.total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || addresses.length === 0}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            <span>{submitting ? 'Placing Order...' : 'Confirm and Place Order'}</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
            <ShieldCheck size={16} style={{ color: '#0d9488' }} />
            <span>Guaranteed Safe Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
