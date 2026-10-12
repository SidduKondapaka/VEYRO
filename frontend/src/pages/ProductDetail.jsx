import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, CheckCircle2, ShieldCheck, Truck, 
  RotateCcw, Star, Share2, AlertCircle, ArrowLeft, Send 
} from 'lucide-react';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { FALLBACK_PRODUCTS } from '../api/fallbackData';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        setSelectedImage(res.data.primaryImageUrl || res.data.imageUrls?.[0] || '');

        // Fetch reviews
        if (res.data.id) {
          const revRes = await api.get(`/products/${res.data.id}/reviews`);
          setReviews(revRes.data.content || []);
        }
      } catch (err) {
        console.warn('Backend currently unreachable, searching fallback catalog:', err);
        const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug) || FALLBACK_PRODUCTS[0];
        setProduct(fallback);
        setSelectedImage(fallback?.primaryImageUrl || '');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#64748b', margin: '1rem 0' }}>The requested product does not exist or has been discontinued.</p>
        <Link to="/products" className="btn btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;
  const inWishlist = isInWishlist(product.id);
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!isOutOfStock) {
      await addToCart(product.id, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (!isOutOfStock) {
      const added = await addToCart(product.id, quantity);
      if (added) {
        navigate('/cart');
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showError('Please sign in to submit a product review.');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      showError('Please provide a review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      });

      setReviews([res.data, ...reviews]);
      showSuccess('Thank you! Your review has been published.');
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);

      // Refresh product to update average rating and count
      const updatedProduct = await api.get(`/products/${slug}`);
      setProduct(updatedProduct.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      showError(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#0d9488' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: '#0d9488' }}>Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.categorySlug}`} style={{ color: '#0d9488' }}>
          {product.categoryName}
        </Link>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
          {product.name}
        </span>
      </div>

      {/* Product Primary Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
        {/* Left Gallery */}
        <div>
          <div
            className="card"
            style={{
              overflow: 'hidden',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              aspectRatio: '1/1',
              position: 'relative',
              marginBottom: '1rem',
            }}
          >
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {hasDiscount && (
              <span
                className="badge badge-teal"
                style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {product.imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(url)}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: selectedImage === url ? '2px solid #0d9488' : '1px solid #e2e8f0',
                    flexShrink: 0,
                    opacity: selectedImage === url ? 1 : 0.7,
                  }}
                >
                  <img src={url} alt={`Thumbnail ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Details & Buy Box */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span className="badge badge-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {product.brand}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Department: {product.categoryName}
            </span>
          </div>

          <h1 style={{ fontSize: '1.9rem', color: '#0f172a', marginBottom: '0.75rem', lineHeight: 1.3 }}>
            {product.name}
          </h1>

          {/* Ratings row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <StarRating rating={product.rating || 0} size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              {product.rating ? Number(product.rating).toFixed(1) : '0.0'}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
              • {product.reviewCount || 0} verified customer reviews
            </span>
          </div>

          {/* Price Box */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                ₹{Number(displayPrice).toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: '#047857', fontWeight: 700, fontSize: '0.9rem' }}>
                    ({discountPercent}% off)
                  </span>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Inclusive of all taxes. Free express shipping on this order.
            </div>
          </div>

          {/* Stock Status */}
          <div style={{ marginBottom: '1.5rem' }}>
            {isOutOfStock ? (
              <span className="badge badge-red" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                Currently Out of Stock
              </span>
            ) : product.stockQuantity <= 5 ? (
              <span className="badge badge-amber" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                Only {product.stockQuantity} units left in stock — order soon!
              </span>
            ) : (
              <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                In Stock ({product.stockQuantity} units available)
              </span>
            )}
          </div>

          {/* Quantity selector and actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '2rem' }}>
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '10px 14px', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 600 }}
                >
                  -
                </button>
                <span style={{ padding: '10px 16px', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  style={{ padding: '10px 14px', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: 600 }}
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn btn-primary"
              style={{ flexGrow: 1, padding: '0.875rem 1.5rem', fontSize: '1rem' }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="btn btn-accent"
              style={{ flexGrow: 1, padding: '0.875rem 1.5rem', fontSize: '1rem' }}
            >
              Buy Now
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="btn btn-secondary"
              style={{
                padding: '0.875rem',
                color: inWishlist ? '#ef4444' : '#64748b',
              }}
              title={inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <Heart size={20} fill={inWishlist ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Trust Value Props */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              padding: '1.25rem 0',
              borderTop: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
              <Truck size={18} style={{ color: '#0d9488' }} /> Fast Delivery
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
              <ShieldCheck size={18} style={{ color: '#0d9488' }} /> Genuine Warranty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
              <RotateCcw size={18} style={{ color: '#0d9488' }} /> 7-Day Returns
            </div>
          </div>

          {/* Product Description */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0f172a' }}>About this item</h3>
            <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: '3rem', marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          
          {/* Reviews List */}
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0f172a' }}>
              Customer Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <p style={{ color: '#64748b' }}>Be the first customer to write a review for this product!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#0d9488',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {rev.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{rev.userName}</div>
                          {rev.verifiedPurchase && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                              <CheckCircle2 size={12} /> Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <StarRating rating={rev.rating} size={14} />
                      {rev.title && <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{rev.title}</span>}
                    </div>

                    <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Box */}
          <div>
            <div className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>Write a Review</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Share your real experience to help other shoppers.
              </p>

              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label className="form-label">Overall Rating</label>
                  <StarRating
                    rating={reviewRating}
                    size={24}
                    interactive
                    onRatingChange={(val) => setReviewRating(val)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Review Headline (optional)</label>
                  <input
                    type="text"
                    placeholder="E.g., Outstanding quality and sound clarity"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Written Feedback</label>
                  <textarea
                    rows={4}
                    placeholder="What did you like or dislike about this product? How was the build quality?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Send size={16} />
                  <span>{submittingReview ? 'Submitting...' : 'Post Customer Review'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0f172a' }}>
            Customers Also Viewed
          </h2>
          <div className="grid-products">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
