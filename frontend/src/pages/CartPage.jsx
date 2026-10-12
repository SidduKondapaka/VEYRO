import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your shopping cart..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', maxWidth: '600px', textAlign: 'center' }}>
        <EmptyState
          icon={ShoppingBag}
          title="Sign in to view your cart"
          description="Your cart is safely persisted on VEYRO. Sign in to access your items and proceed with checkout."
          actionText="Sign In to VEYRO"
          actionLink="/login"
        />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <EmptyState
          icon={ShoppingBag}
          title="Your VEYRO Cart is Empty"
          description="You haven't added any items to your shopping cart yet. Discover trending deals and top-rated essentials now."
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  const freeShippingThreshold = 500;
  const isFreeShipping = cart.subtotal >= freeShippingThreshold;
  const amountNeededForFreeShipping = freeShippingThreshold - cart.subtotal;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Shopping Cart</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="btn btn-secondary btn-sm"
          style={{ color: '#ef4444' }}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 2 }}>
          {/* Free Shipping Notice */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: isFreeShipping ? '#d1fae5' : '#e0f2fe',
              color: isFreeShipping ? '#065f46' : '#0369a1',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {isFreeShipping ? (
              <span>🎉 Congratulations! Your order qualifies for <strong>Free Express Shipping</strong>.</span>
            ) : (
              <span>Add <strong>₹{amountNeededForFreeShipping.toFixed(2)}</strong> more to unlock <strong>Free Shipping</strong>!</span>
            )}
          </div>

          {cart.items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '90px 1fr auto',
                gap: '1.25rem',
                alignItems: 'center',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Image */}
              <Link
                to={`/products/${item.productSlug}`}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f8fafc',
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'}
                  alt={item.productName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>

              {/* Details */}
              <div>
                <Link
                  to={`/products/${item.productSlug}`}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: '4px',
                    display: 'inline-block',
                  }}
                >
                  {item.productName}
                </Link>

                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                  Unit Price: ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      style={{ padding: '6px 10px', backgroundColor: '#f8fafc', fontWeight: 600 }}
                    >
                      -
                    </button>
                    <span style={{ padding: '6px 14px', fontWeight: 600, fontSize: '0.9rem' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock}
                      style={{ padding: '6px 10px', backgroundColor: '#f8fafc', fontWeight: 600 }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>

              {/* Total Item Price */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  ₹{Number(item.subtotal).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#0d9488',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff', position: 'sticky', top: '140px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Items Subtotal:</span>
              <span>₹{Number(cart.subtotal).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Estimated Delivery:</span>
              <span>
                {cart.estimatedShipping === 0 ? (
                  <span style={{ color: '#047857', fontWeight: 600 }}>FREE</span>
                ) : (
                  `₹${Number(cart.estimatedShipping).toLocaleString('en-IN')}`
                )}
              </span>
            </div>

            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              <span>Order Total:</span>
              <span>₹{Number(cart.total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
            <ShieldCheck size={16} style={{ color: '#0d9488' }} />
            <span>Secure 256-bit Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
