import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Zap, Award, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../api/fallbackData';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, featRes, bestRes, newRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/featured'),
          api.get('/products/best-sellers'),
          api.get('/products/new-arrivals'),
        ]);

        setCategories(catRes.data?.length ? catRes.data : FALLBACK_CATEGORIES);
        setFeaturedProducts(featRes.data?.length ? featRes.data : FALLBACK_PRODUCTS);
        setBestSellers(bestRes.data?.length ? bestRes.data : FALLBACK_PRODUCTS.slice(0, 4));
        setNewArrivals(newRes.data?.length ? newRes.data : FALLBACK_PRODUCTS.slice(2, 6));
      } catch (err) {
        console.warn('Backend API currently unreachable, using catalog preview:', err);
        setCategories(FALLBACK_CATEGORIES);
        setFeaturedProducts(FALLBACK_PRODUCTS);
        setBestSellers(FALLBACK_PRODUCTS.slice(0, 4));
        setNewArrivals(FALLBACK_PRODUCTS.slice(2, 6));
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading VEYRO Marketplace..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }}>
      {/* Hero Promotional Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0b1329 0%, #111d40 60%, #0d9488 100%)',
          color: '#ffffff',
          padding: '4.5rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#14b8a6',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={16} /> Technical Training Showcase Project
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.15,
                letterSpacing: '-1px',
                marginBottom: '1.25rem',
              }}
            >
              Next-Gen Shopping Engineered for You.
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2rem' }}>
              Explore curated premium tech, modern fashion, kitchen appliances, and lifestyle essentials. Fast delivery, verified ratings, and seamless checkout.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/products" className="btn btn-primary btn-lg" style={{ boxShadow: '0 4px 20px rgba(13, 148, 136, 0.4)' }}>
                <span>Explore Catalog</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#featured-section"
                className="btn btn-secondary btn-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Featured Deals
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards Carousel / Grid */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Categories
            </span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Shop by Department</h2>
          </div>
          <Link to="/products" style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="card card-hover"
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#f1f5f9',
                }}
              >
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200'}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{cat.name}</h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-section" className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Handpicked
            </span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Featured Products</h2>
          </div>
          <Link to="/products" style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-products">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Value Callout */}
      <section className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #047857 100%)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            color: '#ffffff',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
            boxShadow: '0 10px 30px rgba(13, 148, 136, 0.25)',
          }}
        >
          <div style={{ maxWidth: '540px' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Special Promotion
            </span>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', margin: '0.75rem 0' }}>
              Premium Audio & Wearables
            </h2>
            <p style={{ fontSize: '1rem', color: '#e6fffa', lineHeight: 1.5 }}>
              Immerse yourself in precision sound with titanium drivers, active noise cancellation, and all-day battery performance.
            </p>
          </div>

          <Link
            to="/products?category=electronics"
            className="btn"
            style={{
              backgroundColor: '#ffffff',
              color: '#047857',
              fontWeight: 700,
              padding: '0.875rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            }}
          >
            Shop Electronics
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Popular
            </span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Top Customer Picks</h2>
          </div>
          <Link to="/products?sortBy=popular" style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            See More <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-products">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Just In
            </span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a' }}>New Arrivals</h2>
          </div>
          <Link to="/products?sortBy=newest" style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Explore All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-products">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
