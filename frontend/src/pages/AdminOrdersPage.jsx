import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page: 0, size: 50 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/orders', { params });
      setOrders(res.data.content || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        comment: `Order status moved to ${newStatus} by administrator.`,
      });
      showSuccess(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading customer orders..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Order Fulfillment & Management</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Process shipments, track fulfillment lifecycles, and manage store orders.
        </p>
      </div>

      {/* Filter and Search controls */}
      <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flexGrow: 1, maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="Search by order #, recipient name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.875rem' }}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <Search size={16} /> Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', fontSize: '0.875rem' }}
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Order #</th>
                <th style={{ padding: '12px 16px' }}>Recipient & Contact</th>
                <th style={{ padding: '12px 16px' }}>Items</th>
                <th style={{ padding: '12px 16px' }}>Total Amount</th>
                <th style={{ padding: '12px 16px' }}>Payment</th>
                <th style={{ padding: '12px 16px' }}>Current Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Update Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    No orders matching the current filter.
                  </td>
                </tr>
              ) : (
                (Array.isArray(orders) ? orders : []).map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {o.orderNumber}
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      <div style={{ fontWeight: 600 }}>{o.recipientName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.userEmail}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.phone}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {o.items?.length || 0} items
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${o.paymentStatus === 'PAID' ? 'badge-green' : 'badge-amber'}`}>
                        {o.paymentStatus} ({o.paymentMethod})
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${o.orderStatus === 'DELIVERED' ? 'badge-green' : o.orderStatus === 'CANCELLED' ? 'badge-red' : 'badge-teal'}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="form-select"
                        style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto', display: 'inline-block' }}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
