import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Eye, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  // Cancel order modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders?page=0&size=20');
      setOrders(res.data.content || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await api.post(`/orders/${orderToCancel.id}/cancel?reason=Cancelled by customer`);
      showSuccess(`Order ${orderToCancel.orderNumber} has been cancelled.`);
      setCancelModalOpen(false);
      setOrderToCancel(null);
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-green">DELIVERED</span>;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <span className="badge badge-blue">{status.replace('_', ' ')}</span>;
      case 'PROCESSING':
        return <span className="badge badge-teal">PROCESSING</span>;
      case 'CANCELLED':
        return <span className="badge badge-red">CANCELLED</span>;
      default:
        return <span className="badge badge-amber">{status}</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your order history..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <EmptyState
          icon={Package}
          title="No Orders Yet"
          description="You haven't placed any orders with VEYRO yet. Start browsing to find something you love!"
          actionText="Discover Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>My Orders</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Track recent orders, view purchase details, or request cancellations.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {(Array.isArray(orders) ? orders : []).map((order) => {
          const isCancellable =
            ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus);

          return (
            <div key={order.id} className="card" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
              {/* Card Header */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Order Placed: </span>
                    <strong style={{ color: '#0f172a' }}>{new Date(order.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Order #: </span>
                    <strong style={{ color: '#0f172a' }}>{order.orderNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Total: </span>
                    <strong style={{ color: '#0f172a' }}>₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div>{getStatusBadge(order.orderStatus)}</div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                  {(Array.isArray(order?.items) ? order.items : []).map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                        <img src={item.productImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Qty: {item.quantity} • Unit Price: ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                        ₹{Number(item.totalPrice).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  {isCancellable && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderToCancel(order);
                        setCancelModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                    >
                      <XCircle size={15} /> Cancel Order
                    </button>
                  )}

                  <Link to={`/orders/${order.id}`} className="btn btn-primary btn-sm">
                    <Eye size={15} /> View Order Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${orderToCancel?.orderNumber}? The items will be returned to inventory.`}
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        isDanger
        onConfirm={handleCancelOrder}
        onCancel={() => {
          setCancelModalOpen(false);
          setOrderToCancel(null);
        }}
      />
    </div>
  );
}
