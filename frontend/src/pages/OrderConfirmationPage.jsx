import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/number/${orderNumber}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  if (loading) {
    return <LoadingSpinner fullPage message="Fetching order confirmation..." />;
  }

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem', maxWidth: '780px' }}>
      <div
        className="card"
        style={{
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#d1fae5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <CheckCircle2 size={40} />
        </div>

        <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          Thank You! Your Order is Confirmed
        </h1>

        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
          We’ve received your order and are preparing it for delivery.
        </p>

        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#f0fdfa',
            border: '1px solid #ccfbf1',
            padding: '10px 24px',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600, textTransform: 'uppercase' }}>
            Order Number
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
            {orderNumber}
          </div>
        </div>

        {order && (
          <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Delivery Details</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
              <strong>Recipient:</strong> {order.recipientName} ({order.phone})
            </p>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
              <strong>Address:</strong> {order.shippingAddress}
            </p>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Ordered Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                      <img src={item.productImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span>{item.quantity}x {item.productName}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{Number(item.totalPrice).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              <span>Total Paid:</span>
              <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '2.5rem' }}>
          {order && (
            <Link to={`/orders/${order.id}`} className="btn btn-primary">
              <Package size={16} /> Track Order Status
            </Link>
          )}
          <Link to="/orders" className="btn btn-secondary">
            View All Orders
          </Link>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
