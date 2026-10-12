import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../api/fallbackData';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [pageData, setPageData] = useState({ page: 0, totalPages: 1, totalElements: FALLBACK_PRODUCTS.length });
  const [loading, setLoading] = useState(false);

  // Filters from URL
  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Local state for price inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      } catch (err) {
        // Keep fallback categories intact
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          size: 12,
          sortBy,
          inStockOnly,
        };
        if (keyword) params.keyword = keyword;
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minRating) params.minRating = minRating;

        const res = await api.get('/products', { params });
        if (Array.isArray(res.data?.content)) {
          setProducts(res.data.content);
          setPageData({
            page: res.data.page ?? 0,
            totalPages: res.data.totalPages ?? 1,
            totalElements: res.data.totalElements ?? res.data.content.length,
          });
        }
      } catch (err) {
        console.warn('Backend API currently unreachable, using catalog preview:', err);
        setProducts(FALLBACK_PRODUCTS);
        setPageData({
          page: 0,
          totalPages: 1,
          totalElements: FALLBACK_PRODUCTS.length,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, selectedCategory, minPrice, maxPrice, minRating, inStockOnly, sortBy, page]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    next.set('page', '0'); // Reset page
    setSearchParams(next);
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMinPrice) next.set('minPrice', localMinPrice);
    else next.delete('minPrice');

    if (localMaxPrice) next.set('maxPrice', localMaxPrice);
    else next.delete('maxPrice');

    next.set('page', '0');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '4px' }}>
            {selectedCategory ? `${categories.find(c => c.slug === selectedCategory)?.name || 'Category'}` : keyword ? `Search results for "${keyword}"` : 'All Products'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Showing {pageData.totalElements} results
          </p>
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.875rem' }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Filters Sidebar */}
        <aside className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={18} style={{ color: '#0d9488' }} /> Filters
            </h3>
            {(selectedCategory || minPrice || maxPrice || minRating || inStockOnly || keyword) && (
              <button
                onClick={clearAllFilters}
                style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Department / Category Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#0f172a' }}>Department</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem' }}>
              <button
                onClick={() => updateFilter('category', '')}
                style={{
                  textAlign: 'left',
                  color: !selectedCategory ? '#0d9488' : '#475569',
                  fontWeight: !selectedCategory ? 700 : 400,
                  padding: '4px 0',
                }}
              >
                All Departments
              </button>
              {(Array.isArray(categories) ? categories : FALLBACK_CATEGORIES).map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter('category', c.slug)}
                  style={{
                    textAlign: 'left',
                    color: selectedCategory === c.slug ? '#0d9488' : '#475569',
                    fontWeight: selectedCategory === c.slug ? 700 : 400,
                    padding: '4px 0',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#0f172a' }}>Price (₹)</h4>
            <form onSubmit={handleApplyPrice} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Apply Price
              </button>
            </form>
          </div>

          {/* Customer Rating Filter */}
          <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#0f172a' }}>Customer Rating</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => updateFilter('minRating', minRating === String(stars) ? '' : stars)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    color: minRating === String(stars) ? '#0d9488' : '#475569',
                    fontWeight: minRating === String(stars) ? 700 : 400,
                    padding: '4px 0',
                  }}
                >
                  <div style={{ display: 'flex', color: '#f59e0b' }}>
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" />
                    ))}
                  </div>
                  <span>& Up</span>
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#334155' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
              />
              <span>In Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid & Pagination */}
        <main>
          {loading ? (
            <LoadingSpinner message="Searching catalog..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try relaxing your filters or searching for another keyword."
              actionText="Reset All Filters"
              actionLink="/products"
            />
          ) : (
            <>
              <div className="grid-products">
                {(Array.isArray(products) ? products : FALLBACK_PRODUCTS).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pageData.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem' }}>
                  <button
                    disabled={pageData.page === 0}
                    onClick={() => updateFilter('page', pageData.page - 1)}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>

                  <span style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 8px' }}>
                    Page {pageData.page + 1} of {pageData.totalPages}
                  </span>

                  <button
                    disabled={pageData.page >= pageData.totalPages - 1}
                    onClick={() => updateFilter('page', pageData.page + 1)}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
