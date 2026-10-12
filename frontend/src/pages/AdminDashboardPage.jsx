import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, ShoppingCart, Users, Package, 
  AlertTriangle, ArrowRight, Eye, ShieldCheck 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading store analytics..." />;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: '#0d9488',
      bgColor: '#ccfbf1',
      subtitle: 'Excluding cancellations',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: '#2563eb',
      bgColor: '#dbeafe',
      subtitle: 'All customer checkouts',
    },
    {
      title: 'Registered Users',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: '#7c3aed',
      bgColor: '#ede9fe',
      subtitle: 'Customers & Admins',
    },
    {
      title: 'Active Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: '#059669',
      bgColor: '#d1fae5',
      subtitle: 'Catalog inventory items',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Dashboard Overview</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Real-time snapshot of VEYRO store performance, metrics, and fulfillment.
        </p>
      </div>

      {/* Low stock alert banner */}
      {stats?.lowStockProducts > 0 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>
              Inventory Alert: {stats.lowStockProducts} products have 5 or fewer items remaining in stock.
            </span>
          </div>
          <Link to="/admin/products" className="btn btn-secondary btn-sm">
            Review Stock
          </Link>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {card.value}
                  </div>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: card.bgColor,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} />
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{card.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="card" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Recent Orders</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Latest customer purchases placed on the marketplace</p>
          </div>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Order #</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Total Amount</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(stats?.recentOrders) && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {order.orderNumber}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      {order.recipientName}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${order.orderStatus === 'DELIVERED' ? 'badge-green' : order.orderStatus === 'CANCELLED' ? 'badge-red' : 'badge-teal'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link to="/admin/orders" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                        <Eye size={14} /> Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No recent orders to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
