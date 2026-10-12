import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, CreditCard, Clock, ArrowLeft, 
  XCircle, CheckCircle2, Truck 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      await api.post(`/orders/${order.id}/cancel?reason=Cancelled by customer`);
      showSuccess('Order has been cancelled.');
      setCancelModalOpen(false);
      fetchOrder();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: '#64748b', margin: '1rem 0' }}>The requested order could not be located.</p>
        <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const isCancellable =
    ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus);

  // Status timeline steps
  const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem', maxWidth: '960px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Order Details</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Order #{order.orderNumber} • Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {isCancellable && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ color: '#ef4444' }}
            >
              <XCircle size={15} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Status Tracker */}
      <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#0f172a' }}>Order Progress</h3>

        {isCancelled ? (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
            <XCircle size={20} /> This order was cancelled. Product units have been restored to inventory.
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress line */}
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '20px',
                right: '20px',
                height: '3px',
                backgroundColor: '#e2e8f0',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#0d9488',
                  width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            {steps.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#0d9488' : '#ffffff',
                      border: isCompleted ? '2px solid #0d9488' : '2px solid #cbd5e1',
                      color: isCompleted ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: isCurrent ? 700 : 500, color: isCompleted ? '#0f172a' : '#94a3b8' }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Shipping Address */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <MapPin size={18} style={{ color: '#0d9488' }} /> Shipping Address
          </h3>
          <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{order.recipientName}</p>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>{order.shippingAddress}</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>Phone: {order.phone}</p>
        </div>

        {/* Payment Summary */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <CreditCard size={18} style={{ color: '#0d9488' }} /> Payment & Billing
          </h3>
          <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              <strong>Method: </strong>
              {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Simulated Gateway (DEMO)'}
            </div>
            <div>
              <strong>Status: </strong>
              <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-green' : 'badge-amber'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery:</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${Number(order.shippingFee).toLocaleString('en-IN')}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', marginTop: '4px' }}>
                <span>Total:</span>
                <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: '#0f172a' }}>Items in this Order</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(Array.isArray(order?.items) ? order.items : []).map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8fafc', flexShrink: 0 }}>
                <img src={item.productImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{item.productName}</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Quantity: {item.quantity} • Unit Price: ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                ₹{Number(item.totalPrice).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status History Timeline */}
      {Array.isArray(order?.statusHistory) && order.statusHistory.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <Clock size={18} style={{ color: '#0d9488' }} /> Status History Log
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.statusHistory.map((hist) => (
              <div key={hist.id} style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                <div style={{ minWidth: '140px', color: '#64748b' }}>
                  {new Date(hist.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="badge badge-teal" style={{ marginRight: '8px' }}>{hist.status}</span>
                  <span style={{ color: '#334155' }}>{hist.comment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? All items will be returned to store inventory immediately."
        confirmText="Cancel Order"
        cancelText="Close"
        isDanger
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
