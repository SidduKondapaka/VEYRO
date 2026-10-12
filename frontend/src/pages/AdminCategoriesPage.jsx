import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit2, Trash2, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    iconName: '',
    active: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      iconName: 'Package',
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      description: c.description || '',
      imageUrl: c.imageUrl || '',
      iconName: c.iconName || '',
      active: c.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, formData);
        showSuccess('Category updated!');
      } else {
        await api.post('/admin/categories', formData);
        showSuccess('Category created!');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save category.');
    }
  };

  const handleDelete = async () => {
    if (!catToDelete) return;
    try {
      await api.delete(`/admin/categories/${catToDelete.id}`);
      showSuccess('Category deleted.');
      setDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      showError('Failed to delete category.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading departments..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Department Categories</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage product classification departments and navigation categories.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="card" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Slug</th>
              <th style={{ padding: '12px 16px' }}>Description</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(categories) ? categories : []).map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                      <img src={c.imageUrl || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace' }}>
                  {c.slug}
                </td>
                <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.description}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${c.active ? 'badge-teal' : 'badge-gray'}`}>
                    {c.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button onClick={() => handleOpenEdit(c)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setCatToDelete(c);
                        setDeleteModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', color: '#ef4444' }}
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

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a' }}>{editingId ? 'Edit Department' : 'Add Department'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: '#94a3b8' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Image URL</label>
                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="form-input" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-textarea" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Delete category "${catToDelete?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
