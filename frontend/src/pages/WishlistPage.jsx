import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WishlistPage() {
  const { wishlist, loading, toggleWishlist, moveToCart } = useWishlist();

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your saved items..." />;
  }

  if (!wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save items you love by clicking the heart icon on any product card."
          actionText="Explore Trending Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>My Wishlist</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {wishlist.totalItems} saved {wishlist.totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {wishlist.items.map((item) => {
          const isOutOfStock = item.stockQuantity <= 0;
          const displayPrice = item.salePrice || item.price;

          return (
            <div key={item.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
              <Link
                to={`/products/${item.productSlug}`}
                style={{
                  display: 'block',
                  position: 'relative',
                  paddingTop: '80%',
                  overflow: 'hidden',
                  backgroundColor: '#f8fafc',
                }}
              >
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'}
                  alt={item.productName}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Link
                  to={`/products/${item.productSlug}`}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: '0.5rem',
                    lineHeight: 1.4,
                    height: '2.8rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {item.productName}
                </Link>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    ₹{Number(displayPrice).toLocaleString('en-IN')}
                  </span>
                  {item.salePrice && item.salePrice < item.price && (
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  {isOutOfStock ? (
                    <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>Out of Stock</span>
                  ) : (
                    <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>In Stock</span>
                  )}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => moveToCart(item.productId)}
                    disabled={isOutOfStock}
                    className="btn btn-primary btn-sm"
                    style={{ flexGrow: 1 }}
                  >
                    <ShoppingCart size={15} /> Move to Cart
                  </button>

                  <button
                    onClick={() => toggleWishlist(item.productId)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#ef4444', padding: '0.5rem 0.65rem' }}
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
