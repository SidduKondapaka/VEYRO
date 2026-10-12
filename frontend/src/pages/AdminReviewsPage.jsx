import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews?size=50');
      setReviews(res.data.content || []);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await api.delete(`/admin/reviews/${reviewToDelete.id}`);
      showSuccess('Review deleted.');
      setDeleteModalOpen(false);
      fetchReviews();
    } catch (err) {
      showError('Failed to delete review.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading customer reviews..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Customer Review Moderation</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Inspect user ratings and moderate submitted feedback.
        </p>
      </div>

      <div className="card" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>Product</th>
              <th style={{ padding: '12px 16px' }}>Reviewer</th>
              <th style={{ padding: '12px 16px' }}>Rating</th>
              <th style={{ padding: '12px 16px' }}>Comment</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No customer reviews submitted yet.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a', maxWidth: '200px' }}>
                    {r.productName}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>
                    <div>{r.userName}</div>
                    {r.verifiedPurchase && (
                      <span style={{ fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#f59e0b', fontWeight: 700 }}>
                    ★ {r.rating} / 5
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '300px' }}>
                    {r.title && <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.title}</div>}
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.comment}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setReviewToDelete(r);
                        setDeleteModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', color: '#ef4444' }}
                      title="Delete Review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Review"
        message="Are you sure you want to remove this review from the store?"
        confirmText="Delete"
        cancelText="Cancel"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
