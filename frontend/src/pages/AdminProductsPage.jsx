import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Edit2, Trash2, 
  AlertCircle, X, Check, Eye 
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    price: '',
    salePrice: '',
    stockQuantity: '',
    description: '',
    featured: false,
    active: true,
    imageUrls: [''],
  });

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?size=50&sortBy=newest'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.content || []);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      brand: '',
      categoryId: categories[0]?.id || '',
      price: '',
      salePrice: '',
      stockQuantity: '10',
      description: '',
      featured: false,
      active: true,
      imageUrls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      price: p.price,
      salePrice: p.salePrice || '',
      stockQuantity: p.stockQuantity,
      description: p.description || '',
      featured: p.featured,
      active: p.active,
      imageUrls: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : [''],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        categoryId: Number(formData.categoryId),
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        stockQuantity: Number(formData.stockQuantity),
        description: formData.description.trim(),
        featured: formData.featured,
        active: formData.active,
        imageUrls: formData.imageUrls.filter((url) => url.trim().length > 0),
      };

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        showSuccess('Product updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        showSuccess('Product created successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/admin/products/${productToDelete.id}`);
      showSuccess('Product deactivated successfully.');
      setDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      showError('Failed to deactivate product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <LoadingSpinner fullPage message="Loading catalog management..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Product Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Add, update inventory, manage pricing, and curate products.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Filter products by title, brand, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.925rem' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ color: '#94a3b8' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="card" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Stock</th>
                <th style={{ padding: '12px 16px' }}>Rating</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(filteredProducts) ? filteredProducts : []).map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                        <img src={p.primaryImageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>
                    {p.categoryName}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                    ₹{Number(p.salePrice || p.price).toLocaleString('en-IN')}
                    {p.salePrice && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '6px' }}>
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${p.stockQuantity <= 5 ? 'badge-red' : 'badge-green'}`}>
                      {p.stockQuantity} units
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#0f172a' }}>
                    ★ {p.rating ? Number(p.rating).toFixed(1) : '0.0'} ({p.reviewCount})
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${p.active ? 'badge-teal' : 'badge-gray'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 8px' }}
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(p);
                          setDeleteModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 8px', color: '#ef4444' }}
                        title="Deactivate Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#0f172a' }}>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Department / Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="form-select"
                  >
                    {(Array.isArray(categories) ? categories : []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Regular Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Sale Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Primary Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.imageUrls[0] || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrls: [e.target.value] })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    style={{ accentColor: '#0d9488' }}
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ accentColor: '#0d9488' }}
                  />
                  <span>Active in Store</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${productToDelete?.name}"?`}
        confirmText="Deactivate"
        cancelText="Cancel"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
