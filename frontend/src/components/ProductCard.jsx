import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const displayPrice = hasDiscount ? product.salePrice : product.price;

  const fallbackImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600';
  const imageUrl = product.primaryImageUrl || fallbackImage;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product.id, 1);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Top badges: Discount & Wishlist */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {hasDiscount && (
          <span className="badge badge-teal" style={{ fontWeight: 700 }}>
            {discountPercent}% OFF
          </span>
        )}
        {product.featured && (
          <span className="badge badge-amber" style={{ fontWeight: 700 }}>
            FEATURED
          </span>
        )}
      </div>

      <button
        onClick={handleToggleWishlist}
        title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 2,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: inWishlist ? '#ef4444' : '#64748b',
          transition: 'all 0.2s',
        }}
      >
        <Heart size={18} fill={inWishlist ? '#ef4444' : 'none'} />
      </button>

      {/* Product Image */}
      <Link
        to={`/products/${product.slug}`}
        style={{
          display: 'block',
          position: 'relative',
          paddingTop: '80%',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
        }}
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        {isOutOfStock && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.5px',
            }}
          >
            OUT OF STOCK
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {product.brand}
          </span>
          {product.categoryName && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {product.categoryName}
            </span>
          )}
        </div>

        <Link
          to={`/products/${product.slug}`}
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0f172a',
            marginBottom: '0.5rem',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.8rem',
          }}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
          <StarRating rating={product.rating || 0} size={14} />
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price & Action */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                ₹{Number(displayPrice).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            className="btn btn-primary btn-sm"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
            }}
          >
            <ShoppingCart size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
