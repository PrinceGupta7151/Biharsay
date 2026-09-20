'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
  deleteSubmission,
} from '@/lib/admin';
import { StorySubmission } from '@/types';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<StorySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getAllSubmissions();
    setSubmissions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const ok = await approveSubmission(id);
    if (ok) {
      showToast('Submission approved & published!', 'success');
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'approved' as const } : s))
      );
    } else {
      showToast('Failed to approve submission', 'error');
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectModalId) return;
    setActionLoading(rejectModalId);
    const ok = await rejectSubmission(rejectModalId, rejectReason);
    if (ok) {
      showToast('Submission rejected', 'success');
      setSubmissions((prev) =>
        prev.map((s) => (s.id === rejectModalId ? { ...s, status: 'rejected' as const } : s))
      );
    } else {
      showToast('Failed to reject submission', 'error');
    }
    setRejectModalId(null);
    setRejectReason('');
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this submission?')) return;
    setActionLoading(id);
    const ok = await deleteSubmission(id);
    if (ok) {
      showToast('Submission deleted', 'success');
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } else {
      showToast('Failed to delete submission', 'error');
    }
    setActionLoading(null);
  };

  const filtered = submissions.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        (s.authorName || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="admin-filter-tabs">
        {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            className={filter === tab ? 'active' : ''}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>
            Story Submissions
            <span className="table-count">{filtered.length}</span>
          </h3>
          <div className="admin-table-controls">
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }}
              />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search submissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <FileText size={36} />
            <h4>No submissions found</h4>
            <p>
              {filter === 'all'
                ? 'No community stories have been submitted yet.'
                : `No ${filter} submissions.`}
            </p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <React.Fragment key={sub.id || sub.createdAt}>
                    <tr>
                      <td className="title-cell">{sub.title}</td>
                      <td>{sub.authorName || 'Unknown'}</td>
                      <td>
                        <span className="category-tag">{sub.category}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${sub.status}`}>
                          <span className={`status-dot ${sub.status}`} />
                          {sub.status}
                        </span>
                      </td>
                      <td className="meta-cell">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-btn ghost"
                            onClick={() =>
                              setExpandedId(expandedId === sub.id ? null : (sub.id || null))
                            }
                            title="Preview"
                          >
                            {expandedId === sub.id ? (
                              <ChevronUp size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                          {sub.status === 'pending' && (
                            <>
                              <button
                                className="admin-btn success"
                                onClick={() => handleApprove(sub.id!)}
                                disabled={actionLoading === sub.id}
                                title="Approve"
                              >
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button
                                className="admin-btn danger"
                                onClick={() => setRejectModalId(sub.id || null)}
                                disabled={actionLoading === sub.id}
                                title="Reject"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}
                          <button
                            className="admin-btn danger"
                            onClick={() => handleDelete(sub.id!)}
                            disabled={actionLoading === sub.id}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === sub.id && (
                      <tr>
                        <td colSpan={6}>
                          <div className="admin-preview-panel">
                            {sub.imageUrl && (
                              <div style={{ marginBottom: 14 }}>
                                <strong style={{ display: 'block', marginBottom: 6, color: '#94A3B8' }}>
                                  Story Thumbnail / Cover:
                                </strong>
                                <div style={{ maxWidth: 320, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={sub.imageUrl} alt="Story Thumbnail" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                </div>
                              </div>
                            )}
                            <strong style={{ display: 'block', marginBottom: 6, color: '#94A3B8' }}>
                              Full Content:
                            </strong>
                            <div
                              style={{ marginTop: 4, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: sub.content }}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="admin-modal-backdrop" onClick={() => setRejectModalId(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Submission</h3>
            <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16 }}>
              Optionally provide a reason for rejection:
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Content doesn't meet editorial guidelines..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="admin-modal-actions">
              <button
                className="admin-btn ghost"
                onClick={() => {
                  setRejectModalId(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </button>
              <button className="admin-btn danger" onClick={handleReject}>
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle size={16} color="#34D399" />
          ) : (
            <XCircle size={16} color="#FB7185" />
          )}
          {toast.message}
        </div>
      )}
    </>
  );
}
